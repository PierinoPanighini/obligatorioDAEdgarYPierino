package uy.edu.ort.battleshipdemo.modelo;

public abstract class Tactica {

    private String nombre;
    private Oceano oceanoObjetivo;

    protected Tactica(String nombre) {
        this.nombre = nombre;
    }

    public String getNombre() {
        return nombre;
    }

    // Se configura en la instancia de la partida, no en la opcion del catalogo.
    public void configurarObjetivo(Oceano oceanoObjetivo) {
        if (oceanoObjetivo == null) {
            throw new IllegalArgumentException("El oceano objetivo no puede ser nulo.");
        }
        if (this.oceanoObjetivo != null && this.oceanoObjetivo != oceanoObjetivo) {
            throw new IllegalStateException("La tactica ya tiene otro oceano objetivo. Cree una instancia nueva.");
        }
        this.oceanoObjetivo = oceanoObjetivo;
    }

    protected Oceano getOceanoObjetivo() throws BatallaNavalException {
        if (oceanoObjetivo == null) {
            throw new BatallaNavalException("La tactica no tiene un oceano objetivo configurado.");
        }
        return oceanoObjetivo;
    }

    /**
     * Selecciona un cuadrante disponible del oceano objetivo.
     * La seleccion no marca el cuadrante como disparado.
     */
    public abstract Cuadrante elegirCuadrante() throws BatallaNavalException;

    // Devuelve una instancia nueva, sin objetivo ni progreso de otra partida.
    public abstract Tactica crearNueva();
}
