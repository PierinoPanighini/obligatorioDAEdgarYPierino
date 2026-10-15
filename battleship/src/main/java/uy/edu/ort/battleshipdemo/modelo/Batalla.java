package uy.edu.ort.battleshipdemo.modelo;

import java.util.ArrayList;
import java.util.List;


public class Batalla {

    private int id;
    private String lugar;
    private Tactica tactica;
    private Flota flotaJugador;
    private Flota flotaMaquina;
    private Oceano oceanoJugador;
    private Oceano oceanoMaquina;
    // El estado sería en preparación, En combate, Ganada o Perdida.
    private EstadoBatalla estado;
    private List<Ronda> rondas;
    private List<Barco> bajasEnemigas;
    private List<Barco> bajasAmigas;

    /**
     Creamos batalla nueva con estado EN_PREPARACION. Se le asigna lugar, táctica, flota y océanos.
     */
    public Batalla(int id, String lugar, Tactica tactica, Flota flotaJugador, Flota flotaMaquina, Oceano oceanoJugador, Oceano oceanoMaquina) {
        this.id = id;
        this.lugar = lugar;
        this.tactica = tactica;
        this.flotaJugador = flotaJugador;
        this.flotaMaquina = flotaMaquina;
        this.oceanoJugador = oceanoJugador;
        this.oceanoMaquina = oceanoMaquina;
        this.estado = EstadoBatalla.EN_PREPARACION;
        this.rondas = new ArrayList<>();
        this.bajasEnemigas = new ArrayList<>();
        this.bajasAmigas = new ArrayList<>();
    }

    public int getId() {
        return id;
    }

    public String getLugar() {
        return lugar;
    }

    public Tactica getTactica() {
        return tactica;
    }

    public Flota getFlotaJugador() {
        return flotaJugador;
    }

    public Flota getFlotaMaquina() {
        return flotaMaquina;
    }


    public Oceano getOceanoJugador() {
        return oceanoJugador;
    }

    public Oceano getOceanoMaquina() {
        return oceanoMaquina;
    }

    public EstadoBatalla getEstado() {
        return estado;
    }

//SETTERS
    public void setEstado(EstadoBatalla estado) {
        this.estado = estado;
    }

    public List<Ronda> getRondas() {
        return rondas;
    }

    public List<Barco> getBajasEnemigas() {
        return bajasEnemigas;
    }

}
