package uy.edu.ort.battleshipdemo.modelo;

public class TipoBarco {

    private String nombre;
    private int tamanio;

    public TipoBarco(String nombre, int tamanio) {
        this.nombre = nombre;
        this.tamanio = tamanio;
    }

    public String getNombre() {
        return nombre;
    }

    public int getTamanio() {
        return tamanio;
    }
}
