package uy.edu.ort.battleshipdemo.modelo;

public class Maquina {

    private Flota flota;
    private Oceano oceano;
    private Tactica tactica;

    public Maquina(Flota flota, Oceano oceano, Tactica tactica) {
        if (flota == null || oceano == null || tactica == null) {
            throw new IllegalArgumentException("La maquina debe tener flota, oceano y tactica.");
        }
        this.flota = flota;
        this.oceano = oceano;
        // Cada maquina recibe una instancia propia del algoritmo seleccionado.
        this.tactica = tactica.crearNueva();
    }

    public Flota getFlota() {
        return flota;
    }

    public Oceano getOceano() {
        return oceano;
    }

    public Tactica getTactica() {
        return tactica;
    }
}
