package uy.edu.ort.battleshipdemo.modelo;

public class TacticaSecuencial extends Tactica {

    public TacticaSecuencial() {
        super("Secuencial");
    }

    @Override 
    public Tactica crearNueva() {
        return new TacticaSecuencial();
    } // nueva instancia de la misma clase de la tactica.

    @Override
    public Cuadrante elegirCuadrante() throws BatallaNavalException {
        Oceano oceano = getOceanoObjetivo();
        for (int fila = 0; fila < oceano.getFilas(); fila++) {
            for (int columna = 0; columna < oceano.getColumnas(); columna++) {
                Cuadrante cuadrante = oceano.getCuadrante(fila, columna);

                if (!cuadrante.isDisparado()) {
                    return cuadrante;
                }
            }
        }
        throw new BatallaNavalException("No hay cuadrantes disponibles para disparar");
    }

}
