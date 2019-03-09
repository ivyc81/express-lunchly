/** Reservation for Lunchly */

const moment = require("moment");

const db = require("../db");


/** A reservation for a party */

class Reservation {
  constructor({id, customerId, numGuests, startAt, notes}) {
    this.id = id;
    this.customerId = customerId;
    this.numGuests = numGuests;
    this.startAt = startAt;
    this.notes = notes;
  }

  /** methods for setting/getting startAt time */

  set startAt(val) {
    if (val instanceof Date && !isNaN(val)) this._startAt = val;
    else throw new Error("Not a valid startAt.");
  }

  get startAt() {
    return this._startAt;
  }

  get formattedStartAt() {
    // return moment(this.startAt).format('MMMM Do YYYY, h:mm a');
    return moment(this.startAt).fromNow();
  }

  get formattedStartAtInput() {
    return moment(this.startAt).format('YYYY-MM-DD hh:mm a');
  }

  set numGuests(val) {
    if (!isNaN(val) && val >= 1) this._numGuests = val;
    else throw new Error("Can't make reservation for less than 1.");
  }

  get numGuests() {
    return this._numGuests;
  }

  /** methods for setting/getting notes (keep as a blank string, not NULL) */

  set notes(val) {
    this._notes = val || '';
  }

  get notes() {
    return this._notes;
  }

  /** methods for setting/getting customer ID: can only set once. */

  set customerId(val) {
    if (this._customerId && this._customerId !== val)
      throw new Error('Cannot change customer ID');
    this._customerId = val;
  }

  get customerId() {
    return this._customerId;
  }

  /** given a customer id, find their reservations. */

  static async getReservationsForCustomer(customerId) {
    const results = await db.query(
          `SELECT id,
           customer_id AS "customerId",
           num_guests AS "numGuests",
           start_at AS "startAt",
           notes AS "notes"
         FROM reservations
         WHERE customer_id = $1`,
        [customerId]
    );

    return results.rows.map(row => new Reservation(row));
  }

  async save() {
    if (this.numGuests >= 1) {
      const result = await db.query(
            `INSERT INTO reservations (customer_id, start_at, num_guests, notes)
             VALUES ($1, $2, $3, $4)
             RETURNING id`,
          [this.customerId, this.formattedStartAtInput, this.numGuests, this.notes]);
      this.id = result.rows[0].id;
    }
    // else {
    //   await db.query(
    //         `UPDATE reservations SET customer_id=$1, last_name=$2, phone=$3, notes=$4)
    //          WHERE id=$5`,
    //       [this.firstName, this.lastName, this.phone, this.notes, this.id]);
    // }
  }
}


module.exports = Reservation;
