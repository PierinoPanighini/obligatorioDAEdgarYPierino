package uy.edu.ort.battleshipdemo.modelo;

public class Cuadrante {

    private int fila;
    private int columna;

    //Barco que ocupa esta celda. Si es null, la celda es agua.
    private Barco barco;
    // true si ya recibió un disparo.
    private boolean disparado;

    public Cuadrante(int fila, int columna) {
        this.fila = fila;
        this.columna = columna;
        this.barco = null;
        this.disparado = false;
    }

    public int getFila() {
        return fila;
    }

    public int getColumna() {
        return columna;
    }

    public Barco getBarco() {
        return barco;
    }

    // Setters:

    public void setBarco(Barco barco) {
        this.barco = barco; //cuando se ubica en el océano.
    }

    public boolean isDisparado() {
        return disparado;
    }

    public void setDisparado(boolean disparado) {
        this.disparado = disparado;
    }

}
