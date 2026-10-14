// TODO: crea aquí la classe Contacte i els tipus relacionats

type TCategoria = "familia" | "amics" | "feina";
export type TDadesContacte = {
    nom: string;
    telefon: string;
    email: string;
    categoria: TCategoria;
};


export class Contacte {
    private _nom: string;
    private _telefon: string;
    private _email: string;
    private _categoria: TCategoria;

    constructor(dades: TDadesContacte) {
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

    get nom(): string {
        return this._nom;
    }

    get telefon(): string {
        return this._telefon;
    }

    get email(): string {
        return this._email;
    }

    get categoria(): TCategoria {
        return this._categoria;
    }

    modificar(dades: TDadesContacte) {
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

    ToString(): string {
        return `${this._nom} · ${this._telefon} · ${this._email} · (${this._categoria})`;
    }
}
