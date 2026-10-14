// TODO: crea aquí la classe estàtica Agenda
import { Contacte, TDadesContacte } from './contacte.js';

export class Agenda {
    private static contactes: Map<string, Contacte> = new Map();

    static afegir(contacte: Contacte): void {
        if (this.contactes.has(contacte.telefon)) {
            throw new Error(`Ja existeix un contacte amb el telèfon ${contacte.telefon}.`);
        }
        this.contactes.set(contacte.telefon, contacte);
    }

    static cercar(telefon: string): Contacte | undefined {
        return this.contactes.get(telefon);
    }

    
    static modificar(telefon: string, dades: TDadesContacte): void {
        const contacte = this.contactes.get(telefon);
        if (!contacte) {
            throw new Error(`No s'ha trobat cap contacte amb el telèfon ${telefon}.`);
        }
        contacte.modificar(dades);
    }
    
    static eliminar(telefon: string): void {
        if (!this.contactes.delete(telefon)) {
            throw new Error(`No s'ha trobat cap contacte amb el telèfon ${telefon}.`);
        }
    }

    static llistar(): Contacte[] {
        return Array.from(this.contactes.values());
    }
    
    static cercarPerEmail(email: string): Contacte | undefined {
        const contacte = Array.from(this.contactes.values()).find(contacte => contacte.email === email);
        if (!contacte) {
            throw new Error(`No s'ha trobat cap contacte amb l'email ${email}.`);
        }
        return contacte;
    }

    static filtrarPerCategoria(categoria: string): Contacte[] {
        return Array.from(this.contactes.values()).filter(contacte => contacte.categoria === categoria);
    }

    static noms(): string[] {
        return Array.from(this.contactes.values()).map(contacte => contacte.nom);
    }
    //ha de retornar true si hi ha algun contacte amb la categoria especificada, false en cas contrari
    static hiHaCategoria(categoria: string): boolean {
        return Array.from(this.contactes.values()).some(contacte => contacte.categoria === categoria);
    }

    static ordenats(): Contacte[] {
        return Array.from(this.contactes.values()).sort((a, b) => a.nom.localeCompare(b.nom));
    }
}

