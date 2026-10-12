/**
 * ViewConfig - Configuración de ciclo de vida de una vista
 * Clase privada que encapsula handlers, URLs de inicio/cierre y error handlers
 * Permite marcado explícito de handlers sin mapeo manual
 * 
 * @example
 * // Múltiples handlers para el mismo comando (broadcast intencional)
 * view.handler('mensaje', fn1);
 * view.handler('mensaje', fn2);
 * // Ambos se ejecutan cuando llega el comando 'mensaje'
 */
class ViewConfig {
  constructor(viewName, dispatcher, config = {}) {
    this.viewName = viewName;
    this.dispatcher = dispatcher;
    this.urlInicio = config.urlInicio;
    this.urlCierre = config.urlCierre;
    this.dataInicio = config.dataInicio;
    this.onError = config.onError;
    this.onException = config.onException;
    
    // Map de arrays de handlers: comando -> [fn1, fn2, ...]
    this.handlers = new Map();
    
    // Array de contextIds registrados
    this.contextIds = [];
    
    // Función de cleanup acumulada
    this.cleanup = null;
    
    // Flag de estado
    this.started = false;
  }

  /**
   * Marca un handler para un comando específico
   * Permite múltiples handlers para el mismo comando (se ejecutan todos)
   * 
   * @param {string} commandName - Nombre del comando
   * @param {Function} handlerFn - Función handler
   * @returns {Function} - Retorna la función original sin modificar
   * 
   * @example
   * const handleAgenda = view.handler('agenda', (data) => {
   *   setContactos(data.contactos);
   * });
   */
  handler(commandName, handlerFn) {
    if (!this.handlers.has(commandName)) {
      this.handlers.set(commandName, []);
    }
    this.handlers.get(commandName).push(handlerFn);
    return handlerFn;
  }

  /**
   * Inicia la vista: registra handlers y ejecuta URL de inicio
   * MÉTODO PRIVADO - Usar CommandDispatcher.startView(viewConfig) en su lugar
   * 
   * Si ya estaba iniciada, limpia y re-registra (útil para hot-reload)
   * ADVERTENCIA: Si se llama _start() múltiples veces, los handlers intermedios
   * registrados por componentes hijos entre llamadas se perderán.
   * @private
   */
  _start() {
    // Si ya está iniciada, limpiar estado anterior
    if (this.started && this.cleanup) {
      this.cleanup();
      this.contextIds = [];
    }

    // Convertir Map de arrays de handlers a objeto plano
    const handlersObj = {};
    this.handlers.forEach((handlerArray, commandName) => {
      if (handlerArray.length === 1) {
        handlersObj[commandName] = handlerArray[0];
      } else {
        handlersObj[commandName] = (parametro) => {
          handlerArray.forEach(handler => {
            try {
              handler(parametro);
            } catch (e) {
              console.error(`Error en handler '${commandName}':`, e);
            }
          });
        };
      }
    });

    // Registrar handlers
    this.cleanup = this.dispatcher.mapFunctions(handlersObj, {
      onError: this.onError,
      onException: this.onException
    });

    // Ejecutar URL de inicio
    if (this.urlInicio) {
      this.dispatcher.submit(this.urlInicio, this.dataInicio || {});
    }

    // Registrar beforeunload
    if (this.urlCierre) {
      this.dispatcher.registerCloseView(this.urlCierre, {}, this.cleanup);
    }

    this.started = true;
  }

  /**
   * Finaliza la vista: ejecuta URL de cierre y limpia handlers
   * MÉTODO PRIVADO - Usar CommandDispatcher.finishView(viewConfig) en su lugar
   * Conceptualmente: 1 vista = 1 cierre
   * @private
   */
  _finish() {
    // Ejecutar URL de cierre
    if (this.urlCierre) {
      this.dispatcher.submit(this.urlCierre, {});
      this.urlCierre = null; // 1 vista = 1 cierre
    }

    // Ejecutar cleanup
    if (this.cleanup) {
      this.cleanup();
      this.cleanup = null;
    }

    this.contextIds = [];
    this.started = false;
    this.dispatcher.views.delete(this.viewName);
  }
}

/**
 * CommandDispatcher - Sistema de dispatch minimalista
 * Solo ejecuta handlers explícitamente registrados con mapFunctions()
 * No busca en window, no auto-inicialización, totalmente explícito
 * Ideal para usar con frameworks o arquitecturas modernas
 */

class CommandDispatcher {
  constructor() {
    // Map de contextos: cada contexto tiene sus funciones y handlers
    this.contexts = new Map();
    // Callbacks de cierre de vista
    this.cleanupCallbacks = [];
    this.closeViewUrl = null;
    this.beforeUnloadRegistered = false;
    // Map de vistas activas (ViewConfig)
    this.views = new Map();
  }

  /**
   * Registra múltiples funciones a la vez con sus handlers de error
   * @param {Object} handlers - { nombreComando: (parametro) => {...}, ... }
   * @param {Object} options - { onError: (status, text) => {...}, onException: (msg) => {...} }
   * @returns {Function} - Función para desregistrar todo el contexto
   */
  mapFunctions(handlers, options = {}) {
    const contextId = Symbol('context');
    const functionsMap = new Map();
    
    // Guardar funciones en el Map del contexto
    Object.entries(handlers).forEach(([name, handler]) => {
      if (typeof handler === 'function') {
        functionsMap.set(name, handler);
      } else {
        console.warn(`Handler para '${name}' no es una función`);
      }
    });

    // Guardar contexto con sus funciones y handlers
    this.contexts.set(contextId, {
      functions: functionsMap,
      onError: options.onError,
      onException: options.onException
    });

    // Retornar función de cleanup
    return () => {
      this.contexts.delete(contextId);
    };
  }

  /**
   * Registra una función individual (para uso avanzado)
   * @param {string} commandName - Nombre del comando
   * @param {Function} handler - Función que recibe el parametro
   * @returns {Function} - Función para desregistrar
   */
  mapFunction(commandName, handler) {
    return this.mapFunctions({ [commandName]: handler });
  }

  /**
   * Limpia todos los contextos registrados
   */
  clearAll() {
    this.contexts.clear();
  }

  /**
   * Registra una nueva vista con configuración de ciclo de vida
   * 
   * @param {string} viewName - Nombre único de la vista
   * @param {Object} config - Configuración de la vista
   * @param {string} [config.urlInicio] - URL para notificar inicio
   * @param {string} [config.urlCierre] - URL para notificar cierre
   * @param {Object} [config.dataInicio] - Datos para enviar en inicio
   * @param {Function} [config.onError] - Handler de errores HTTP
   * @param {Function} [config.onException] - Handler de excepciones
   * @returns {ViewConfig} - Instancia de ViewConfig
   * 
   * @example
   * const viewConfig = CommandDispatcher.registerView('Estados', {
   *   urlInicio: '/estados/vistaConectada',
   *   urlCierre: '/estados/vistaCerrada',
   *   onException: (msg) => mostrarMensaje(msg)
   * });
   * viewConfig.handler('estados', (lista) => mostrarEstados(lista));
   * CommandDispatcher.startView(viewConfig);
   */
  registerView(viewName, config = {}) {
    const view = new ViewConfig(viewName, this, config);
    this.views.set(viewName, view);
    return view;
  }

  /**
   * Inicia una vista registrada: registra handlers y ejecuta URL de inicio
   * 
   * @param {ViewConfig} viewConfig - Vista a iniciar
   * 
   * @example
   * const viewConfig = CommandDispatcher.registerView('Estados', {...});
   * viewConfig.handler('estados', fn);
   * CommandDispatcher.startView(viewConfig);
   */
  startView(viewConfig) {
    viewConfig._start();
  }

  /**
   * Finaliza una vista: ejecuta URL de cierre y limpia handlers
   * 
   * @param {ViewConfig} viewConfig - Vista a finalizar
   * 
   * @example
   * return () => CommandDispatcher.finishView(viewConfig);
   */
  finishView(viewConfig) {
    viewConfig._finish();
  }

  /**
   * Envía una notificación de cierre usando sendBeacon (garantiza llegada al servidor)
   * Útil para beforeunload o cuando la ventana se está cerrando
   * @param {string} url - URL del endpoint
   * @param {Object|string} data - Datos a enviar (opcional)
   */
  notifyClose(url, data = {}) {
    let bodyData;
    
    if (typeof data === 'string') {
      bodyData = data;
    } else {
      const urlEncodedData = new URLSearchParams();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          urlEncodedData.append(key, value);
        }
      });
      bodyData = urlEncodedData.toString();
    }

    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      navigator.sendBeacon(url, bodyData);
    } else {
      // Fallback para entornos sin sendBeacon
      console.warn('sendBeacon no disponible, usando fetch con keepalive');
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: bodyData,
        keepalive: true
      }).catch(e => console.error('Error en notifyClose:', e));
    }
  }

  /**
   * Registra una URL de cierre que se llamará automáticamente al cerrar la ventana
   * y configura el manejo automático de beforeunload
   * @param {string} url - URL a notificar al cerrar
   * @param {Object|string} data - Datos a enviar (opcional)
   * @param {Function} onBeforeClose - Callback adicional a ejecutar antes de cerrar (opcional)
   */
  registerCloseView(url, data = {}, onBeforeClose = null) {
    this.closeViewUrl = { url, data };
    
    if (onBeforeClose) {
      this.cleanupCallbacks.push(onBeforeClose);
    }

    this._ensureBeforeUnloadRegistered();
  }

  /**
   * Agrega un callback de cleanup que se ejecutará al cerrar la vista
   * Auto-registra el listener de beforeunload si es necesario
   * @param {Function} callback - Función a ejecutar
   */
  addCleanupCallback(callback) {
    if (typeof callback === 'function') {
      this.cleanupCallbacks.push(callback);
      this._ensureBeforeUnloadRegistered();
    }
  }

  /**
   * Asegura que el listener de beforeunload esté registrado (solo una vez)
   * @private
   */
  _ensureBeforeUnloadRegistered() {
    if (!this.beforeUnloadRegistered && typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this._handleBeforeUnload();
      });
      this.beforeUnloadRegistered = true;
    }
  }

  /**
   * Maneja el evento beforeunload ejecutando cleanups y notificando cierre
   * @private
   */
  _handleBeforeUnload() {
    // Notificar cierre de todas las vistas activas (ViewConfig)
    this.views.forEach(view => {
      if (view.urlCierre) {
        this.notifyClose(view.urlCierre, {});
        view.urlCierre = null; // 1 vista = 1 cierre
      }
      if (view.cleanup) {
        try {
          view.cleanup();
        } catch (e) {
          console.error(`Error en cleanup de vista '${view.viewName}':`, e);
        }
      }
    });

    // Ejecutar callbacks de cleanup legacy (compatibilidad)
    this.cleanupCallbacks.forEach(callback => {
      try {
        callback();
      } catch (e) {
        console.error('Error en cleanup callback:', e);
      }
    });

    // Notificar cierre legacy (compatibilidad)
    if (this.closeViewUrl) {
      this.notifyClose(this.closeViewUrl.url, this.closeViewUrl.data);
    }
  }

  /**
   * Procesa un objeto Commands del backend
   * @param {Object} data - Objeto con propiedad commands: { commands: [...] }
   */
  processCommands(data) {
    if (!data?.commands || !Array.isArray(data.commands)) {
      console.error('Respuesta no cumple contrato Commands. Esperado: { commands: [...] }, recibido:', data);
      return;
    }
    this._processCommands(data.commands);
  }

  /**
   * Ejecuta un submit al backend
   * @param {string} url - URL del endpoint
   * @param {Object|string} data - Datos a enviar
   */
  async submit(url, data = {}) {
    let bodyData;
    
    if (typeof data === 'string') {
      bodyData = data;
    } else {
      const urlEncodedData = new URLSearchParams();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          urlEncodedData.append(key, value);
        }
      });
      bodyData = urlEncodedData.toString();
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        credentials: 'include',
        body: bodyData
      });

      const status = response.status;
      const text = await response.text();

      // Errores HTTP
      if (status < 200 || status > 299) {
        this._notifyError(status, text, url, bodyData);
        return;
      }

      // Excepciones de aplicación (status 299)
      if (status === 299) {
        this._notifyException(text);
        return;
      }

      // Parsear y procesar respuestas
      try {
        // Si la respuesta está vacía, no hay nada que procesar
        if (!text || text.trim() === '') {
            console.log('Respuesta vacía del servidor (sin comandos)');
            return;
        }
        const json = JSON.parse(text);
        
        // Contrato explícito: debe tener propiedad "commands"
        if (json.commands && Array.isArray(json.commands)) {
          this._processCommands(json.commands);
        } else {
          console.error('Respuesta no cumple contrato Commands:', json);
        }
      } catch (e) {
        console.error('Error al parsear JSON:', text, e);
      }

    } catch (error) {
      this._notifyError(0, error.message, url, bodyData);
    }
  }

  /**
   * Procesa lista de comandos ejecutando TODOS los handlers registrados
   * Si el backend envió el comando, el frontend debe ejecutarlo.
   * Si está registrado en varios componentes, todos se ejecutan.
   * @private
   */
  _processCommands(commands) {
    commands.forEach(command => {
      const { id, parametro } = command;
      
      const matchingHandlers = [];
      
      // Recolectar TODOS los handlers registrados para este comando
      this.contexts.forEach(context => {
        const handler = context.functions.get(id);
        if (handler) {
          matchingHandlers.push(handler);
        }
      });

      // Info en desarrollo si hay múltiples handlers (comportamiento intencional)
      if (matchingHandlers.length > 1 && console.debug) {
        console.debug(`ℹ️ Comando '${id}' ejecutándose en ${matchingHandlers.length} contextos`);
      }

      // Ejecutar TODOS los handlers encontrados
      matchingHandlers.forEach(handler => {
        try {
          handler(parametro);
        } catch (e) {
          console.error(`Error ejecutando función '${id}':`, e);
        }
      });

      // Advertir si ningún handler registrado
      if (matchingHandlers.length === 0) {
        console.warn(`⚠️ Comando '${id}' no tiene handlers registrados`, parametro);
      }
    });
  }

  /**
   * Notifica error HTTP a los contextos que tengan handlers
   * @private
   */
  _notifyError(status, text, url, data) {
    console.error('Error en submit:', { status, text, url, data });
    
    let notified = false;
    this.contexts.forEach(context => {
      if (context.onError && typeof context.onError === 'function') {
        try {
          context.onError(status, text);
          notified = true;
        } catch (e) {
          console.error('Error en handler de errores:', e);
        }
      }
    });

    if (!notified) {
      console.warn('Error HTTP no manejado');
    }
  }

  /**
   * Notifica excepción de aplicación
   * @private
   */
  _notifyException(mensaje) {
    console.error('Excepción de aplicación:', mensaje);
    
    let notified = false;
    this.contexts.forEach(context => {
      if (context.onException && typeof context.onException === 'function') {
        try {
          context.onException(mensaje);
          notified = true;
        } catch (e) {
          console.error('Error en handler de excepciones:', e);
        }
      }
    });

    if (!notified) {
      console.warn('Excepción no manejada:', mensaje);
      if (typeof alert !== 'undefined') {
        alert(mensaje);
      }
    }
  }
}

// Crear y exportar instancia única (singleton)
const dispatcher = new CommandDispatcher();

// Para ES modules - exportar como default y named export (compatibilidad React)
export default dispatcher;
export { dispatcher as CommandDispatcher };

// Para uso global
if (typeof window !== 'undefined') {
  window.CommandDispatcher = dispatcher;
}
if (typeof globalThis !== 'undefined') {
  globalThis.CommandDispatcher = dispatcher;
}
