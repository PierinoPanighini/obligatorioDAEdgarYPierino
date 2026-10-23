package uy.edu.ort.battleshipdemo.modelo;

import java.util.ArrayList;
import java.util.List;

public class Flota {

    private List<Barco> barcos;

    public Flota() {
        this.barcos = new ArrayList<>();
    }

    public void agregarBarco(Barco barco) {
        this.barcos.add(barco);
    }

    public List<Barco> getBarcos() {
        return new ArrayList<>(barcos);
    }

    public Flota crearFlotaEquivalente() {
        Flota equivalente = new Flota();
        for (Barco barco : barcos) {
            equivalente.agregarBarco(new Barco(barco.getTipoBarco()));
        }
        return equivalente;
    }

    public boolean quedoTodaHundida() {
        for (Barco barco : barcos) {
            if (!barco.estaHundido()) {
                return false;
            }
        }
        return true;
    }
}
