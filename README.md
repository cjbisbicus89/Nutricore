#  NutriCore 
NutriCore es un ecosistema de salud inteligente impulsado por un **Agente de IA proactivo** que analiza métricas metabólicas en tiempo real para optimizar el progreso físico.

##  ¿Qué hace el Agente de IA?
1. **Acompañamiento:** Alertas inmediatas si tus hábitos diarios que ponen en riesgo tu meta.
2. **Ajuste de Estancamiento:** Recalibra el plan automáticamente si detecta una variación de peso menor a 0.3kg.
3. **Contexto Real:** Adapta los requerimientos según la calidad de tu sueño y nivel de actividad.
4. **Gráfica de Historial:** Visualización dinámica de la evolución del peso (subidas y bajadas) para proyectar tu meta final.

---

##  Stack Tecnológico

### **Backend**
* **NestJS:** Arquitectura escalable y eficiente.
* **Gemini AI:** Motor para el análisis proactivo y generación de mensajes.
* **Redis:** Gestión de cache y estabilidad del servicio.
* **MySQL:** Persistencia segura de historiales métricos.
* **Socket.io:** Sincronización de datos en tiempo real.

### **Frontend**
* **React + Vite:** Interfaz moderna y ultra-rápida.
* **Recharts:** Implementación de la gráfica de historial metabólico.
* **Lucide React:** Iconografía profesional y minimalista.
* **Axios:** Comunicación con el API y validación estricta de datos.

### **Infraestructura**
* **Docker & Docker Compose:** Contenerización de todo el ecosistema para despliegue inmediato 
---

## ⚡ Instalación Rápida

Para levantar MySQL, Redis, Backend y Frontend en un solo paso:


docker-compose down -v
docker-compose up --build -d
