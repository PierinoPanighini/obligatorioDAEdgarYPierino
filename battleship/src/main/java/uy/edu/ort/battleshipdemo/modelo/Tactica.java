package uy.edu.ort.battleshipdemo.modelo;

public abstract class Tactica {

    private String nombre;

    protected Tactica(String nombre) {
        this.nombre = nombre;
    }

    public String getNombre() {
        return nombre;
    }

    /**
     * Selecciona un cuadrante que todavia no haya recibido un disparo.
     * La seleccion no marca el cuadrante como disparado.
     */
    public abstract Cuadrante elegirCuadrante(Oceano oceano) throws BatallaNavalException;

    public abstract Tactica crearNueva(); //metodo fabrica para crear una nueva instancia de la misma clase de la tactica.
}
