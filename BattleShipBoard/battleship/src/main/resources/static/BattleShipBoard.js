/**
 * BattleShipBoard
 *
 * Componente visual desacoplado de la lógica de la aplicación.
 * Escucha exclusivamente los comandos:
 *
 *   inicializar:
 *     {
 *       numeroCeldasVerticales: number,
 *       numeroCeldasHorizontales: number,
 *       escuchador?: string
 *     }
 *
 *   mostrar:
 *     {
 *       coordenadaVertical: number,
 *       coordenadaHorizontal: number,
 *       valor: string
 *     }
 *
 * El componente no conoce reglas de Batalla Naval.
 * Solo renderiza lo que recibe.
 *
 * Tamaño: las celdas siempre se muestran cuadradas, sin importar cuántas
 * filas/columnas tenga el tablero. El tamaño se calcula a partir de
 * `opciones` (tercer parámetro del constructor) o, si no se especifica,
 * a partir del tamaño real del contenedor:
 *
 *   new BattleShipBoard(container, dispatcher, {
 *     anchoMaximo: 600,   // px, opcional
 *     altoMaximo: 420,    // px, opcional
 *     tamanoCelda: 40,    // px, opcional: fuerza el tamaño de celda
 *     tamanoFuente: 22,   // px, opcional: tamaño de fuente de todos los textos (título, celdas, índices, bajas)
 *     tamanoIcono: 28,    // px, opcional: tamaño de fuente de los íconos (barco/agua/impacto)
 *   });
 */
const LAYOUT_DEFAULTS = {
  indexColumnWidth: 28,
  indexRowHeight: 24,
  titleHeight: 24,
  bajasHeight: 34,
  gap: 24,
  minCellSize: 16,
  anchoPorDefecto: 480,
  altoPorDefecto: 480,
};

export default class BattleShipBoard {
  constructor(container, dispatcher, opciones = {}) {
    if (!container) {
      throw new Error("BattleShipBoard: no se encontró el elemento contenedor.");
    }
    if (
      !dispatcher ||
      typeof dispatcher.mapFunctions !== "function" ||
      typeof dispatcher.submit !== "function"
    ) {
      throw new Error(
        "BattleShipBoard: se necesita una instancia válida de CommandDispatcher con submit()."
      );
    }

    this.container = container;
    this.dispatcher = dispatcher;
    this.opciones = opciones;
    if (Number.isFinite(this.opciones.tamanoFuente)) {
      this.container.style.setProperty(
        "--battle-ship-board-font-size",
        `${this.opciones.tamanoFuente}px`
      );
    }
    if (Number.isFinite(this.opciones.tamanoIcono)) {
      this.container.style.setProperty(
        "--battle-ship-board-icon-font-size",
        `${this.opciones.tamanoIcono}px`
      );
    }
    this.rows = 0;
    this.columns = 0;
    this.cells = [];
    this.ownCells = [];
    this.enemyCells = [];
    this.paneles = {};
    this._layout = null;
    this._resizeObserver = null;
    this._resizeTimeout = null;
    this.cleanup = null;
    this.started = false;
    this.escuchadorOceanoPropio = null;
    this.escuchadorOceanoEnemigo = null;
    this.bajasEnemigasLabel = null;
    this.bajasEnemigasValue = "Ninguna";

    this._installStyles();
    this._registerHandlers();
    this._setupResizeObserver();
  }

  /**
   * Registra los handlers directamente en el CommandDispatcher.
   * Gracias al diseño actual del dispatcher, estos comandos también
   * pueden ser recibidos por otros componentes que los tengan registrados.
   */
  _registerHandlers() {
    this.cleanup = this.dispatcher.mapFunctions({
      inicializar: (parametro) => this.inicializar(parametro),
      mostrarAguasPropias: (parametro) => this.mostrarAguasPropias(parametro),
      mostrarAguasEnemigas: (parametro) => this.mostrarAguasEnemigas(parametro),
      mostrar: (parametro) => this.mostrarAguasPropias(parametro),
      bajasEnemigas: (parametro) => this.actualizarBajasEnemigas(parametro),
    });

    this.started = true;
  }

  inicializar(parametros = {}) {
    const {
      numeroCeldasVerticales,
      numeroCeldasHorizontales,
      escuchador,
      escuchadorOceanoPropio,
      escuchadorOceanoEnemigo,
    } = parametros;

    this._validatePositiveInteger(
      numeroCeldasVerticales,
      "numeroCeldasVerticales"
    );
    this._validatePositiveInteger(
      numeroCeldasHorizontales,
      "numeroCeldasHorizontales"
    );

    this.rows = numeroCeldasVerticales;
    this.columns = numeroCeldasHorizontales;
    this.escuchadorOceanoPropio = this._normalizeListener(
      escuchadorOceanoPropio ?? escuchador
    );
    this.escuchadorOceanoEnemigo = this._normalizeListener(
      escuchadorOceanoEnemigo
    );

    console.log(
      this.escuchadorOceanoPropio || this.escuchadorOceanoEnemigo
        ? `BattleShipBoard: escuchadores definidos -> propio=${this.escuchadorOceanoPropio ?? "sin listener"}, enemigo=${this.escuchadorOceanoEnemigo ?? "sin listener"}`
        : "BattleShipBoard: tableros read-only (sin escuchadores)."
    );

    this.paneles = {};
    this.container.replaceChildren();
    this.container.classList.add("battle-ship-board-host");
    this.container.style.display = "flex";
    this.container.style.justifyContent = "center";
    this.container.style.alignItems = "flex-start";

    this._layout = this._computeLayout();

    const boardSet = document.createElement("div");
    boardSet.className = "battle-ship-board-set";

    const tableroPropio = this._createBoardPanel(
      "Aguas propias",
      this.escuchadorOceanoPropio,
      "propio"
    );
    const tableroEnemigo = this._createBoardPanel(
      "Aguas enemigas",
      this.escuchadorOceanoEnemigo,
      "enemigo"
    );

    boardSet.appendChild(tableroPropio);
    boardSet.appendChild(tableroEnemigo);
    this.container.appendChild(boardSet);

    this.actualizarBajasEnemigas(this.bajasEnemigasValue);
  }

  _normalizeListener(value) {
    return typeof value === "string" && value.trim() ? value.trim() : null;
  }

  /**
   * Ancho/alto disponibles para todo el componente (ambos tableros + separación).
   * Prioriza `opciones`; si falta, mide el contenedor (forzando un tamaño por
   * defecto si está colapsado, ej. sin CSS propio).
   */
  _getAvailableSize() {
    const { anchoMaximo, altoMaximo } = this.opciones;

    if (Number.isFinite(anchoMaximo) && Number.isFinite(altoMaximo)) {
      this.container.style.width = `${anchoMaximo}px`;
      this.container.style.height = `${altoMaximo}px`;
      return { ancho: anchoMaximo, alto: altoMaximo };
    }

    let rect = this.container.getBoundingClientRect();
    if (!rect.width || !rect.height) {
      this.container.style.width =
        this.container.style.width || `${LAYOUT_DEFAULTS.anchoPorDefecto}px`;
      this.container.style.height =
        this.container.style.height || `${LAYOUT_DEFAULTS.altoPorDefecto}px`;
      rect = this.container.getBoundingClientRect();
    }

    return {
      ancho: anchoMaximo ?? rect.width,
      alto: altoMaximo ?? rect.height,
    };
  }

  /**
   * Calcula un tamaño de celda cuadrado que entra tanto a lo ancho como a
   * lo alto, para que la proporción filas/columnas nunca deforme la celda.
   */
  _computeLayout() {
    const {
      indexColumnWidth,
      indexRowHeight,
      titleHeight,
      bajasHeight,
      gap,
      minCellSize,
    } = LAYOUT_DEFAULTS;

    let cellSize;
    if (Number.isFinite(this.opciones.tamanoCelda)) {
      // Tamaño explícito: se respeta tal cual, sin forzar un mínimo.
      cellSize = this.opciones.tamanoCelda;
    } else {
      const { ancho, alto } = this._getAvailableSize();
      const anchoPorTablero = (ancho - gap) / 2;
      const altoPorTablero = alto - titleHeight - bajasHeight;
      const porAncho = (anchoPorTablero - indexColumnWidth) / this.columns;
      const porAlto = (altoPorTablero - indexRowHeight) / this.rows;
      cellSize = Math.max(minCellSize, Math.floor(Math.min(porAncho, porAlto)));
    }

    return {
      indexColumnWidth,
      indexRowHeight,
      cellSize,
      boardWidth: indexColumnWidth + this.columns * cellSize,
      boardHeight: this.rows * cellSize + indexRowHeight,
    };
  }

  _setupResizeObserver() {
    if (typeof ResizeObserver === "undefined") {
      return;
    }
    this._resizeObserver = new ResizeObserver(() => this._scheduleRecalculo());
    this._resizeObserver.observe(this.container);
  }

  _scheduleRecalculo() {
    clearTimeout(this._resizeTimeout);
    this._resizeTimeout = setTimeout(() => this._recalcularLayout(), 120);
  }

  /** Recalcula únicamente el tamaño (sin perder el contenido ya dibujado). */
  _recalcularLayout() {
    if (!this.started || !this.rows || !this.columns) {
      return;
    }

    this._layout = this._computeLayout();
    const { indexColumnWidth, indexRowHeight, cellSize, boardWidth, boardHeight } =
      this._layout;

    Object.values(this.paneles).forEach(({ panel, board }) => {
      board.style.gridTemplateColumns = `${indexColumnWidth}px repeat(${this.columns}, ${cellSize}px)`;
      board.style.gridTemplateRows = `repeat(${this.rows}, ${cellSize}px) ${indexRowHeight}px`;
      board.style.width = `${boardWidth}px`;
      board.style.height = `${boardHeight}px`;
      panel.style.width = `${boardWidth}px`;
    });
  }

  _createBoardPanel(title, escuchador, boardType) {
    const panel = document.createElement("div");
    panel.className = "battle-ship-board-panel";

    const titleElement = document.createElement("div");
    titleElement.className = "battle-ship-board-title";
    titleElement.textContent = title;

    const board = document.createElement("div");
    board.className = "battle-ship-board";
    board.setAttribute("role", "grid");
    board.setAttribute(
      "aria-label",
      `Tablero de batalla de ${this.rows} por ${this.columns}`
    );

    const { indexColumnWidth, indexRowHeight, cellSize, boardWidth, boardHeight } =
      this._layout;
    board.style.gridTemplateColumns = `${indexColumnWidth}px repeat(${this.columns}, ${cellSize}px)`;
    board.style.gridTemplateRows = `repeat(${this.rows}, ${cellSize}px) ${indexRowHeight}px`;
    board.style.width = `${boardWidth}px`;
    board.style.height = `${boardHeight}px`;
    panel.style.width = `${boardWidth}px`;

    const cells = Array.from({ length: this.rows }, () =>
      Array(this.columns).fill(null)
    );

    for (let visualRow = 0; visualRow < this.rows; visualRow++) {
      const coordenadaVertical = this.rows - 1 - visualRow;

      const rowIndex = document.createElement("div");
      rowIndex.className = "battle-ship-board-index battle-ship-board-index-vertical";
      rowIndex.dataset.rowIndex = String(visualRow);
      rowIndex.textContent = String(coordenadaVertical);
      rowIndex.style.gridColumn = "1";
      rowIndex.style.gridRow = String(visualRow + 1);
      board.appendChild(rowIndex);

      for (let coordenadaHorizontal = 0; coordenadaHorizontal < this.columns; coordenadaHorizontal++) {
        const cell = document.createElement("div");
        cell.className = "battle-ship-board-cell";
        cell.setAttribute("role", "gridcell");
        cell.style.gridColumn = String(coordenadaHorizontal + 2);
        cell.style.gridRow = String(visualRow + 1);
        cell.dataset.coordenadaVertical = String(coordenadaVertical);
        cell.dataset.coordenadaHorizontal = String(coordenadaHorizontal);
        cell.dataset.rowIndex = String(visualRow);
        cell.dataset.columnIndex = String(coordenadaHorizontal);

        cell.addEventListener("mouseenter", () =>
          this._setBoardHoverState(board, visualRow, coordenadaHorizontal, true)
        );
        cell.addEventListener("mouseleave", () =>
          this._setBoardHoverState(board, visualRow, coordenadaHorizontal, false)
        );

        if (escuchador) {
          cell.addEventListener("click", () =>
            this._handleCellClick(boardType, coordenadaVertical, coordenadaHorizontal)
          );
        }

        board.appendChild(cell);
        cells[coordenadaVertical][coordenadaHorizontal] = cell;
      }
    }

    for (let coordenadaHorizontal = 0; coordenadaHorizontal < this.columns; coordenadaHorizontal++) {
      const horizontalIndex = document.createElement("div");
      horizontalIndex.className = "battle-ship-board-index battle-ship-board-index-horizontal";
      horizontalIndex.dataset.columnIndex = String(coordenadaHorizontal);
      horizontalIndex.textContent = String(coordenadaHorizontal);
      horizontalIndex.style.gridColumn = String(coordenadaHorizontal + 2);
      horizontalIndex.style.gridRow = String(this.rows + 1);
      board.appendChild(horizontalIndex);
    }

    panel.appendChild(titleElement);
    panel.appendChild(board);

    if (boardType === "propio") {
      this.ownCells = cells;
    } else {
      this.enemyCells = cells;
      const bajasContainer = document.createElement("div");
      bajasContainer.className = "battle-ship-board-bajas";

      const bajasLabel = document.createElement("span");
      bajasLabel.className = "battle-ship-board-bajas-label";
      bajasLabel.textContent = "Bajas enemigas:";

      const bajasValor = document.createElement("span");
      bajasValor.className = "battle-ship-board-bajas-valor";
      bajasValor.textContent = this.bajasEnemigasValue;
      this.bajasEnemigasLabel = bajasValor;

      bajasContainer.appendChild(bajasLabel);
      bajasContainer.appendChild(bajasValor);
      panel.appendChild(bajasContainer);
    }

    this.paneles[boardType] = { panel, board };

    return panel;
  }

  mostrarAguasPropias({
    coordenadaVertical,
    coordenadaHorizontal,
    valor,
  } = {}) {
    this._mostrarEnTablero("propio", {
      coordenadaVertical,
      coordenadaHorizontal,
      valor,
    });
  }

  mostrarAguasEnemigas({
    coordenadaVertical,
    coordenadaHorizontal,
    valor,
  } = {}) {
    this._mostrarEnTablero("enemigo", {
      coordenadaVertical,
      coordenadaHorizontal,
      valor,
    });
  }

  mostrar(parametros = {}) {
    return this.mostrarAguasPropias(parametros);
  }

  _mostrarEnTablero(boardType, {
    coordenadaVertical,
    coordenadaHorizontal,
    valor,
  } = {}) {
    this._validateInteger(coordenadaVertical, "coordenadaVertical");
    this._validateInteger(coordenadaHorizontal, "coordenadaHorizontal");

    const cells = boardType === "enemigo" ? this.enemyCells : this.ownCells;

    if (!Array.isArray(cells) || cells.length === 0) {
      console.warn(
        `BattleShipBoard: se recibió 'mostrar${boardType === "enemigo" ? "AguasEnemigas" : "AguasPropias"}' antes de 'inicializar'.`
      );
      return;
    }

    if (
      coordenadaVertical < 0 ||
      coordenadaVertical >= this.rows ||
      coordenadaHorizontal < 0 ||
      coordenadaHorizontal >= this.columns
    ) {
      console.warn(
        `BattleShipBoard: coordenada fuera de rango (${coordenadaVertical}, ${coordenadaHorizontal}).`
      );
      return;
    }

    const cell = cells[coordenadaVertical]?.[coordenadaHorizontal];
    if (!cell) {
      return;
    }

    cell.replaceChildren();

    const normalizedValue =
      typeof valor === "string" ? valor.trim().toLowerCase() : "";
    const icon = this._createIcon(normalizedValue);

    if (icon) {
      cell.appendChild(icon);
      cell.setAttribute(
        "aria-label",
        `Fila ${coordenadaVertical}, columna ${coordenadaHorizontal}: ${valor}`
      );
    } else {
      const text = document.createElement("span");
      text.className = "battle-ship-board-value";
      text.textContent = valor ?? "";
      cell.appendChild(text);
      cell.setAttribute(
        "aria-label",
        `Fila ${coordenadaVertical}, columna ${coordenadaHorizontal}: ${valor ?? ""}`
      );
    }
  }

  actualizarBajasEnemigas(valor = "Ninguna") {
    const texto = typeof valor === "string" && valor.trim() ? valor.trim() : "Ninguna";
    this.bajasEnemigasValue = texto;

    if (this.bajasEnemigasLabel) {
      this.bajasEnemigasLabel.textContent = texto;
    }
  }

  destroy() {
    if (this.cleanup) {
      this.cleanup();
      this.cleanup = null;
    }

    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
      this._resizeObserver = null;
    }
    clearTimeout(this._resizeTimeout);

    this.started = false;
    this.escuchadorOceanoPropio = null;
    this.escuchadorOceanoEnemigo = null;
    this.ownCells = [];
    this.enemyCells = [];
    this.cells = [];
    this.paneles = {};
    this._layout = null;
    this.rows = 0;
    this.columns = 0;
    this.bajasEnemigasLabel = null;
    this.bajasEnemigasValue = "Ninguna";
    this.container.replaceChildren();
    this.container.classList.remove("battle-ship-board-host");
    this.container.style.removeProperty("width");
    this.container.style.removeProperty("height");
    this.container.style.removeProperty("display");
    this.container.style.removeProperty("justify-content");
    this.container.style.removeProperty("align-items");
  }

  _handleCellClick(boardType, coordenadaVertical, coordenadaHorizontal) {
    const endpoint =
      boardType === "enemigo"
        ? this.escuchadorOceanoEnemigo
        : this.escuchadorOceanoPropio;

    console.log(
      `BattleShipBoard click: tablero=${boardType}, coordenadaVertical=${coordenadaVertical}, coordenadaHorizontal=${coordenadaHorizontal}`
    );

    if (!endpoint) {
      console.log(
        `BattleShipBoard: tablero ${boardType} read-only; no escuchador definido.`
      );
      return;
    }

    console.log(`BattleShipBoard: escuchador -> ${endpoint}`);

    this.dispatcher.submit(endpoint, {
      coordenadaVertical,
      coordenadaHorizontal,
    });
  }

  _setBoardHoverState(board, rowIndex, columnIndex, active) {
    const rowActiveColor = "rgb(81, 116, 204)";
    const cellActiveColor = "rgb(111, 188, 255)";
    const defaultCellColor = "rgb(150, 200, 255)";
    const defaultIndexColor = "rgb(150, 150, 150)";

    board.querySelectorAll(".battle-ship-board-index-vertical").forEach((index) => {
      const matchesRow = Number(index.dataset.rowIndex) === rowIndex;
      const isActive = active && matchesRow;
      index.style.background = isActive ? rowActiveColor : defaultIndexColor;
      index.style.boxShadow = isActive ? "inset 0 0 0 2px rgba(30, 64, 175, 0.35)" : "none";
      index.style.color = "#fff";
    });

    board.querySelectorAll(".battle-ship-board-index-horizontal").forEach((index) => {
      const matchesColumn = Number(index.dataset.columnIndex) === columnIndex;
      const isActive = active && matchesColumn;
      index.style.background = isActive ? rowActiveColor : defaultIndexColor;
      index.style.boxShadow = isActive ? "inset 0 0 0 2px rgba(30, 64, 175, 0.35)" : "none";
      index.style.color = "#fff";
    });

    board.querySelectorAll(".battle-ship-board-cell").forEach((cell) => {
      const matchesCell =
        Number(cell.dataset.rowIndex) === rowIndex &&
        Number(cell.dataset.columnIndex) === columnIndex;
      const isActive = active && matchesCell;
      cell.style.background = isActive ? cellActiveColor : defaultCellColor;
      cell.style.boxShadow = isActive ? "inset 0 0 0 3px rgba(29, 78, 216, 0.35)" : "none";
      cell.style.transform = isActive ? "translateY(-1px)" : "none";
    });
  }

  _createIcon(valor) {
    const symbol = {
      barco: "🚢",
      agua: "🌊",
      impacto: "🔥",
      nada: "  ",
    }[valor];

    if (!symbol) {
      return null;
    }

    const icon = document.createElement("span");
    icon.className = "battle-ship-board-icon";
    icon.textContent = symbol;
    icon.setAttribute("aria-hidden", "true");
    return icon;
  }

  _installStyles() {
    const styleId = "battle-ship-board-styles";
    let style = document.getElementById(styleId);

    if (!style) {
      style = document.createElement("style");
      style.id = styleId;
      document.head.appendChild(style);
    }

    style.textContent = `
      .battle-ship-board-host {
        display: block;
        width: 100%;
        height: 100%;
        min-width: 0;
        min-height: 0;
        box-sizing: border-box;
      }

      .battle-ship-board-set {
        display: flex;
        width: 100%;
        gap: 1.5rem;
        justify-content: center;
        align-items: flex-start;
        flex-wrap: wrap;
      }

      .battle-ship-board-panel {
        flex: 0 0 auto;
        min-width: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
        justify-content: flex-start;
      }

      .battle-ship-board-title {
        font-family: Tahoma, Arial, sans-serif;
        font-size: var(--battle-ship-board-font-size, 1rem);
        font-weight: 700;
        color: #1f2937;
        text-align: center;
      }

      .battle-ship-board {
        display: grid;
        min-width: 0;
        min-height: 0;
        box-sizing: border-box;
        border: 2px solid rgb(200, 200, 200);
        background: #fff;
        font-family: Tahoma, Arial, sans-serif;
      }

      .battle-ship-board-corner {
        background: rgb(150, 150, 150);
        border-right: 1px solid rgb(170, 170, 170);
        border-bottom: 1px solid rgb(170, 170, 170);
      }

      .battle-ship-board-cell {
        min-width: 0;
        min-height: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
        border-right: 1px solid rgb(170, 170, 170);
        border-bottom: 1px solid rgb(170, 170, 170);
        background: rgb(150, 200, 255);
        overflow: hidden;
        user-select: none;
        font-size: var(--battle-ship-board-font-size, 1.6rem);
        transition: background-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease;
      }

      .battle-ship-board-cell:hover,
      .battle-ship-board-cell.battle-ship-board-cell-hovered {
        background: rgb(111, 188, 255);
        box-shadow: inset 0 0 0 3px rgba(29, 78, 216, 0.35);
        transform: translateY(-1px);
      }

      .battle-ship-board-index {
        display: flex;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
        background: rgb(150, 150, 150);
        color: #fff;
        font-size: var(--battle-ship-board-font-size, 0.8rem);
        font-weight: 700;
        border-right: 1px solid rgb(170, 170, 170);
        border-bottom: 1px solid rgb(170, 170, 170);
        transition: background-color 0.15s ease, color 0.15s ease, box-shadow 0.15s ease;
      }

      .battle-ship-board-index.battle-ship-board-index-hovered {
        background: rgb(81, 116, 204);
        color: #fff;
        box-shadow: inset 0 0 0 2px rgba(30, 64, 175, 0.35);
      }

      .battle-ship-board-index-horizontal {
        background: rgb(150, 150, 150);
      }

      .battle-ship-board-icon {
        display: block;
        line-height: 1;
        font-size: var(--battle-ship-board-icon-font-size, 1.9rem);
      }

      .battle-ship-board-value {
        font-family: Tahoma, Arial, sans-serif;
        font-size: var(--battle-ship-board-font-size, 1rem);
        color: #222;
        text-align: center;
        overflow-wrap: anywhere;
      }

      .battle-ship-board-bajas {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: var(--battle-ship-board-font-size, 0.95rem);
        color: #1f2937;
        background: rgb(104, 176, 70);
        box-sizing: border-box;
        padding: 0.4rem 0.5rem;
        border: 0px solid rgb(104, 176, 70);
      }

      .battle-ship-board-bajas-label {
        font-family: Tahoma, Arial, sans-serif;
        font-weight: 700;
      }

      .battle-ship-board-bajas-valor {
        min-height: 1.2rem;
        color: #374151;
        font-family: Tahoma, Arial, sans-serif;
      }
    `;

    document.head.appendChild(style);
  }

  _validatePositiveInteger(value, name) {
    this._validateInteger(value, name);
    if (value <= 0) {
      throw new Error(
        `BattleShipBoard: '${name}' debe ser mayor que cero.`
      );
    }
  }

  _validateInteger(value, name) {
    if (!Number.isInteger(value)) {
      throw new Error(
        `BattleShipBoard: '${name}' debe ser un número entero.`
      );
    }
  }
}
