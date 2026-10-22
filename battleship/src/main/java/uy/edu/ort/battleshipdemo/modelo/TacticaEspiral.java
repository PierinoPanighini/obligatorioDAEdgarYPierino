package uy.edu.ort.battleshipdemo.modelo;

public class TacticaEspiral extends Tactica {

    public TacticaEspiral() {
        super("Espiral");
    }

    @Override
    public Cuadrante elegirCuadrante(Oceano oceano) throws BatallaNavalException {
        int fila = oceano.getFilas() / 2;
        int columna = (oceano.getColumnas() - 1) / 2;
        int direccion = 0; // 0: derecha, 1: abajo, 2: izquierda, 3: arriba
        int largo = 1;
        int pasos = 0;
        int usos = 0;
        int revisadas = 0;
        int total = oceano.getFilas() * oceano.getColumnas();

        while (revisadas < total) {
            if (oceano.estaDentro(fila, columna)) {
                revisadas++;
                Cuadrante cuadrante = oceano.getCuadrante(fila, columna);
                if (!cuadrante.isDisparado()) {
                    return cuadrante;
                }
            }

            // dar un paso según la dirección
            if (direccion == 0) {
                columna++;
            } else if (direccion == 1) {
                fila--;
            } else if (direccion == 2) {
                columna--;
            } else {
                fila++;
            }
            pasos++;

            // ¿terminé el tramo?
            if (pasos == largo) {
                if (direccion < 3) {
                    direccion = direccion + 1;
                } else {
                    direccion = 0;
                }
                pasos = 0;
                usos++;
                if (usos == 2) {
                    largo++;
                    usos = 0;
                }
            }
        }
        throw new BatallaNavalException("No hay cuadrantes disponibles para disparar");
    }
}
