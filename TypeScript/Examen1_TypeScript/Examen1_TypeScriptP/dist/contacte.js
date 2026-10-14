export class Contacte {
    _nom;
    _telefon;
    _email;
    _categoria;
    constructor(dades) {
        const nomRegex = /^[a-zA-Z\s]+$/;
        const telefonRegex = /^[6789]\d{8}$/;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!nomRegex.test(dades.nom)) {
            throw new Error("El nom no és vàlid");
        }
        if (dades.nom.length < 2) {
            throw new Error("El nom ha de tenir almenys 2 caràcters");
        }
        if (dades.nom.length > 30) {
            throw new Error("El nom no pot tenir més de 30 caràcters");
        }
        if (!telefonRegex.test(dades.telefon)) {
            throw new Error("El telèfon no és vàlid");
        }
        if (!emailRegex.test(dades.email)) {
            throw new Error("L'email no és vàlid");
        }
        if (!["familia", "amics", "feina"].includes(dades.categoria)) {
            throw new Error("La categoria no és vàlida");
        }
        this._nom = dades.nom;
        this._telefon = dades.telefon;
        this._email = dades.email;
        this._categoria = dades.categoria;
    }
    get nom() {
        return this._nom;
    }
    get telefon() {
        return this._telefon;
    }
    get email() {
        return this._email;
    }
    get categoria() {
        return this._categoria;
    }
    modificar(dades) {
        const nomRegex = /^[a-zA-Z\s]+$/;
        const telefonRegex = /^[6789]\d{8}$/;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!nomRegex.test(dades.nom)) {
            throw new Error("El nom no és vàlid");
        }
        if (!telefonRegex.test(dades.telefon)) {
            throw new Error("El telèfon no és vàlid");
        }
        if (!emailRegex.test(dades.email)) {
            throw new Error("L'email no és vàlid");
        }
        if (!["familia", "amics", "feina"].includes(dades.categoria)) {
            throw new Error("La categoria no és vàlida");
        }
        this._nom = dades.nom;
        this._telefon = dades.telefon;
        this._email = dades.email;
        this._categoria = dades.categoria;
    }
    ToString() {
        return `${this._nom} · ${this._telefon} · ${this._email} · (${this._categoria})`;
    }
}
//# sourceMappingURL=contacte.js.map