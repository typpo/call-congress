class Callee {
  constructor(firstName, lastName, phone, chamber) {
    this._firstName = firstName;
    this._lastName = lastName;
    this._phone = phone;
    this._chamber = chamber;
  }

  getFirstName() {
    return this._firstName;
  }

  getLastName() {
    return this._lastName;
  }

  getFullName() {
    return `${this._firstName} ${this._lastName}`;
  }

  getPhone() {
    return this._phone;
  }

  getChamber() {
    return this._chamber;
  }
}

module.exports = {
  Callee,
};
