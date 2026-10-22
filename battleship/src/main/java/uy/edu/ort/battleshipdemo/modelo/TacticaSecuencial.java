package uy.edu.ort.battleshipdemo.modelo;

public class TacticaSecuencial extends Tactica {

    public TacticaSecuencial() {
        super("Secuencial");
    }

    @Override
    public Cuadrante elegirCuadrante(Oceano oceano) throws BatallaNavalException {
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
