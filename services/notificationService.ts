
export const NotificationService = {
  /**
   * Solicita permisos al usuario de forma asíncrona.
   */
  async requestPermission(): Promise<NotificationPermission | 'unsupported'> {
    if (!('Notification' in window)) {
      console.warn('Este navegador no soporta notificaciones de escritorio.');
      return 'unsupported';
    }
    
    if (Notification.permission === 'default') {
      return await Notification.requestPermission();
    }
    
    return Notification.permission;
  },

  /**
   * Envía una notificación si los permisos han sido concedidos.
   */
  send(title: string, body: string, icon: string = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png') {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon,
          badge: icon,
          tag: 'stetic-app-notif',
          silent: false,
        });
      } catch (err) {
        console.error('Error al disparar la notificación:', err);
      }
    }
  }
};
