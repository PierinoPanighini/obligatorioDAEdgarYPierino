package uy.edu.ort.battleshipdemo.modelo;

import java.util.ArrayList;
import java.util.List;

public class Batalla {

    private static int proximoId = 1;

    private final int id;
    private String lugar;
    private Jugador jugador;
    private Maquina maquina;
    private EstadoBatalla estado;
    private List<Ronda> rondas;
    private List<Barco> bajasEnemigas;
    private List<Barco> bajasAmigas;

    public Batalla(String lugar, Jugador jugador, Maquina maquina) {
        if (jugador == null || maquina == null) {
            throw new IllegalArgumentException("La batalla debe tener un jugador y una maquina.");
        }
        if (jugador.getFlota() == maquina.getFlota() || jugador.getOceano() == maquina.getOceano()) {
            throw new IllegalArgumentException("Los participantes deben tener flotas y oceanos independientes.");
        }
        maquina.getTactica().configurarObjetivo(jugador.getOceano());
        this.id = generarId();
        this.lugar = lugar;
        this.jugador = jugador;
        this.maquina = maquina;
        this.estado = EstadoBatalla.EN_PREPARACION;
        this.rondas = new ArrayList<>();
        this.bajasEnemigas = new ArrayList<>();
        this.bajasAmigas = new ArrayList<>();
    }

    private static synchronized int generarId() {
        return proximoId++;
    }

    public synchronized void colocarBarco(Barco barco, Cuadrante proa, Orientacion orientacion)
            throws BatallaNavalException {
        if (estado != EstadoBatalla.EN_PREPARACION) {
            throw new BatallaNavalException("Solo se pueden colocar barcos durante la preparacion.");
        }
        if (!jugador.getFlota().getBarcos().contains(barco)) {
            throw new BatallaNavalException("No puede ubicar un barco que no pertenece a su flota.");
        }
        jugador.getOceano().colocarBarco(barco, proa, orientacion);
    }

    public int getId() {
        return id;
    }

    public String getLugar() {
        return lugar;
    }

    public Jugador getJugador() {
        return jugador;
    }

    public Maquina getMaquina() {
        return maquina;
    }

    public Tactica getTactica() {
        return maquina.getTactica();
    }

    public Flota getFlotaJugador() {
        return jugador.getFlota();
    }

    public Flota getFlotaMaquina() {
        return maquina.getFlota();
    }

    public Oceano getOceanoJugador() {
        return jugador.getOceano();
    }

    public Oceano getOceanoMaquina() {
        return maquina.getOceano();
    }

    public EstadoBatalla getEstado() {
        return estado;
    }

    public void setEstado(EstadoBatalla estado) {
        this.estado = estado;
    }

    public List<Ronda> getRondas() {
        return rondas;
    }

    public List<Barco> getBajasEnemigas() {
        return bajasEnemigas;
    }

    public List<Barco> getBajasAmigas() {
        return bajasAmigas;
    }
}
