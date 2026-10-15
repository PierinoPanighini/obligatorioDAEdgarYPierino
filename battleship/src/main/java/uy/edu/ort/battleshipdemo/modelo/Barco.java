package uy.edu.ort.battleshipdemo.modelo;

import java.util.ArrayList;
import java.util.List;

/*
Un barco de la flota de un jugador.Su nombre y tamaño los conoce su TipoBarco (Experto).
 */
public class Barco {

    //FIXME: LE PONEMOS ID??

    private TipoBarco tipoBarco;

    private Orientacion orientacion;

    // Cuadrantes que ocupa en el océano. El primero sería la proa
    private List<Cuadrante> cuadrantes;

    public Barco(TipoBarco tipoBarco) {
        this.tipoBarco = tipoBarco;
        this.cuadrantes = new ArrayList<>();
    }

    public TipoBarco getTipoBarco() {
        return tipoBarco;
    }

    public Orientacion getOrientacion() {
        return orientacion;
    }

    //la orientación se elige recién al ubicar el barco.
    public void setOrientacion(Orientacion orientacion) {
        this.orientacion = orientacion;
    }

    public List<Cuadrante> getCuadrantes() {
        return cuadrantes;
    }
}
