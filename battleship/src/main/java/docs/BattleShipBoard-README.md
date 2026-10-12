# BattleShipBoard

Componente visual reutilizable para una aplicación web basada en `CommandDispatcher`.
Renderiza los tableros "Aguas propias" y "Aguas enemigas", además del indicador
de "Bajas enemigas".

## Integración paso a paso

### En la solución

1. **Verificar que `CommandDispatcher` esté funcionando.**

   `BattleShipBoard` depende de este framework: lo necesita para registrar los
   comandos del componente y para enviar solicitudes al Presenter. Antes de
   continuar, comprueba que la vista de tu aplicación pueda iniciar el
   `CommandDispatcher` y comunicarse con el backend.

2. **Agregar `BattleShipBoard.js` junto a `CommandDispatcher.js`.**

   Copia el archivo del componente a la misma carpeta donde está el dispatcher,
   por ejemplo, en la carpeta de recursos estáticos de la aplicación.

### En la vista HTML

3. **Agregar el contenedor del tablero.**

   ```html
   <div id="tablero"></div>
   ```

4. **Importar el componente como módulo.**

   La ruta del import debe apuntar a la ubicación de `BattleShipBoard.js`:

   ```javascript
   import BattleShipBoard from "./BattleShipBoard.js";
   ```

5. **Crear el tablero y vincularlo con el CommandDispatcher.**

   El contenedor debe tener un `id` para que JavaScript pueda encontrarlo. Crea
   una instancia del tablero después de importar `CommandDispatcher` y
   `BattleShipBoard`:

   ```html
   <script type="module">
     import CommandDispatcher from "./CommandDispatcher.js";
     import BattleShipBoard from "./BattleShipBoard.js";

     const view = CommandDispatcher.registerView("BatallaNaval", {
       urlInicio: "/inicializarVista"
     });

     ////////////////////////////////////////////////////////////////
     const board = new BattleShipBoard(
       document.getElementById("tablero"),
       CommandDispatcher,
       { anchoMaximo: 1000, altoMaximo: 1000, tamanoFuente: 12, tamanoIcono: 28 }
     );
     ////////////////////////////////////////////////////////////////

     CommandDispatcher.startView(view);
   </script>
   ```

   `anchoMaximo` y `altoMaximo` limitan el espacio del componente. Si no se
   indican, se usa el tamaño del contenedor; si el contenedor no tiene tamaño,
   el componente usa un tamaño predeterminado. También se puede indicar
   `tamanoCelda` para fijar el tamaño de cada celda. Las celdas siempre son
   cuadradas.

### En el Presenter

6. **Enviar el comando `inicializar` cuando se carga la vista.**

   Configura `urlInicio` en la vista con la ruta de un endpoint del Presenter.
   Ese endpoint devuelve el comando `inicializar` con la cantidad de filas y
   columnas de ambos tableros:

   ```java
   @PostMapping("/inicializarVista")
   public Commands inicializarVista() {
       Command inicializar = new Command(
           "inicializar",
           new InicializarDto(8, 12, "/clickEnAguasPropias", "/clickEnAguasEnemigas")
       );
       return Commands.create(inicializar);
   }
   ```

   En este ejemplo se configura un tablero de 8 filas por 12 columnas. Las
   dimensiones pueden ser distintas.

7. **Definir los endpoints para los escuchadores de aguas propias y enemigas.**

   Los nombres de las rutas deben coincidir con los valores configurados en el
   paso anterior. Cuando el usuario selecciona una celda, el componente envía
   sus coordenadas al endpoint correspondiente. El Presenter procesa la acción
   y devuelve los comandos que actualizan el tablero:

   ```java
   @PostMapping("/clickEnAguasPropias")
   public Commands ubicarBarco(int coordenadaVertical, int coordenadaHorizontal) {
       Command barco = new Command(
           "mostrarAguasPropias",
           new ValorDto(coordenadaVertical, coordenadaHorizontal, "barco")
       );
       return Commands.create(barco);
   }

   @PostMapping("/clickEnAguasEnemigas")
   public Commands disparar(int coordenadaVertical, int coordenadaHorizontal) {
       Command disparo = new Command(
           "mostrarAguasEnemigas",
           new ValorDto(coordenadaVertical, coordenadaHorizontal, "agua")
       );
       return Commands.create(disparo);
   }
   ```

   Si no se configura un endpoint para uno de los tableros, ese tablero queda
   en modo de solo lectura.

8. **Enviar comandos para mostrar las celdas según corresponda.**

   Al inicializar la vista, o como resultado de una acción del usuario, el
   Presenter puede devolver uno o más comandos `mostrarAguasPropias` o
   `mostrarAguasEnemigas`. Usa `ValorDto` con coordenadas y el valor a mostrar:

   ```java
   Command barcoPropio = new Command(
       "mostrarAguasPropias",
       new ValorDto(1, 1, "barco")
   );
   Command aguaEnemiga = new Command(
       "mostrarAguasEnemigas",
       new ValorDto(6, 7, "agua")
   );
   Command impacto = new Command(
       "mostrarAguasEnemigas",
       new ValorDto(4, 4, "impacto")
   );

   return Commands.create(barcoPropio, aguaEnemiga, impacto);
   ```

   Las coordenadas comienzan en cero: `(0, 0)` es la primera celda. El valor
   `bajasEnemigas` actualiza el indicador de bajas; si no se envía ese comando,
   el tablero muestra "Ninguna".

## Valores de iconos incluidos

El componente incluye estos valores sin depender de imágenes externas:

- `barco`: 🚢
- `agua`: 🌊
- `impacto`: 🔥
- Un espacio en blanco: celda vacía
