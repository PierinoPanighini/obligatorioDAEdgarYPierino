package uy.edu.ort.battleshipdemo.modelo;

import java.util.ArrayList;
import java.util.List;

public class SistemaBatallas {

    private List<Batalla> batallas;
    private List<TipoBarco> tiposBarco;
    private List<Tactica> tacticas;

    public SistemaBatallas() {
        this.batallas = new ArrayList<>();
        this.tiposBarco = new ArrayList<>();
        this.tacticas = new ArrayList<>();
    }

    // Gestion de batallas
    public void registrarBatalla(Batalla batalla) {
        this.batallas.add(batalla);
    }

    public List<Batalla> listarBatallas() {
        return new ArrayList<>(batallas);
    }

    public Batalla buscarBatalla(int id) {
        for (Batalla batalla : batallas) {
            if (batalla.getId() == id) {
                return batalla;
            }
        }
        return null;
    }

    public int contarBatallasGanadas() {
        return contarBatallas(EstadoBatalla.GANADA);
    }

    public int contarBatallasPerdidas() {
        return contarBatallas(EstadoBatalla.PERDIDA);
    }

    public double calcularExitoCampania() {
        int ganadas = contarBatallasGanadas();
        int perdidas = contarBatallasPerdidas();
        int terminadas = ganadas + perdidas;

        if (terminadas == 0) {
            return 0.0;
        }

        return ganadas * 100.0 / terminadas;
    }

    private int contarBatallas(EstadoBatalla estado) {
        int cantidad = 0;
        for (Batalla batalla : batallas) {
            if (batalla.getEstado() == estado) {
                cantidad++;
            }
        }
        return cantidad;
    }

    // Tipos barco
    public void registrarTipoBarco(TipoBarco tipoBarco) {
        this.tiposBarco.add(tipoBarco);
    }

    public List<TipoBarco> listarTiposBarco() {
        return new ArrayList<>(tiposBarco);
    }

    // Tacticas

    public void registrarTactica(Tactica tactica) {
        this.tacticas.add(tactica);
    }

    public List<Tactica> listarTacticas() {
        return new ArrayList<>(tacticas);
    }

}
