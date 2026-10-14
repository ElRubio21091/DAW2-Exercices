export class Agenda {
    static contactes = new Map();
    static afegir(contacte) {
        if (this.contactes.has(contacte.telefon)) {
            throw new Error(`Ja existeix un contacte amb el telèfon ${contacte.telefon}.`);
        }
        this.contactes.set(contacte.telefon, contacte);
    }
    static cercar(telefon) {
        return this.contactes.get(telefon);
    }
    static modificar(telefon, dades) {
        const contacte = this.contactes.get(telefon);
        if (!contacte) {
            throw new Error(`No s'ha trobat cap contacte amb el telèfon ${telefon}.`);
        }
        contacte.modificar(dades);
    }
    static eliminar(telefon) {
        if (!this.contactes.delete(telefon)) {
            throw new Error(`No s'ha trobat cap contacte amb el telèfon ${telefon}.`);
        }
    }
    static llistar() {
        return Array.from(this.contactes.values());
    }
    static cercarPerEmail(email) {
        const contacte = Array.from(this.contactes.values()).find(contacte => contacte.email === email);
        if (!contacte) {
            throw new Error(`No s'ha trobat cap contacte amb l'email ${email}.`);
        }
        return contacte;
    }
    static filtrarPerCategoria(categoria) {
        return Array.from(this.contactes.values()).filter(contacte => contacte.categoria === categoria);
    }
    static noms() {
        return Array.from(this.contactes.values()).map(contacte => contacte.nom);
    }
    static hiHaCategoria(categoria) {
        return Array.from(this.contactes.values()).some(contacte => contacte.categoria === categoria);
    }
    static ordenats() {
        return Array.from(this.contactes.values()).sort((a, b) => a.nom.localeCompare(b.nom));
    }
}
//# sourceMappingURL=agenda.js.map