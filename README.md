# Colecta Fomento

Frontend en React, TypeScript y Vite para seguir el avance de una colecta con datos sincronizados desde Google Sheets mediante un endpoint HTTP publico.

La aplicacion muestra el progreso sobre el objetivo de $5.000.000, los registros disponibles, su estado y la hora de la ultima sincronizacion exitosa.

## Configuracion

1. Crea un archivo `.env` a partir de `.env.example`.
2. Configura la URL publica que devuelve los datos de la hoja:

   ```env
   VITE_GOOGLE_SHEETS_API_URL=https://tu-endpoint-publico.example.com/datos
   VITE_SHEETS_SYNC_INTERVAL=30000
   ```

No incluyas claves privadas, tokens ni credenciales de Google en variables `VITE_*`: Vite las expone en el navegador.

## Ejecutar

```bash
npm install
npm run dev
```

Verificaciones disponibles:

```bash
npm run typecheck
npm run lint
npm run build
```

## Sincronizacion

La consulta inicial se realiza al abrir la pantalla. Luego la informacion se actualiza cada 30 segundos, o con el valor configurado en `VITE_SHEETS_SYNC_INTERVAL`. El boton **Actualizar ahora** permite solicitar una sincronizacion manual.

Las solicitudes no se superponen, se cancelan al desmontar la interfaz y los ultimos datos validos se conservan si una actualizacion posterior falla.

## Formato JSON esperado

```json
{
  "data": [
    {
      "id": "recaudacion-general",
      "totalRecaudado": 1250000,
      "estado": "En curso"
    }
  ],
  "updatedAt": "2026-08-04T21:00:00.000Z"
}
```

`data` debe ser un arreglo y `updatedAt` una fecha ISO valida. Cada registro requiere `totalRecaudado`; `id` y `estado` son opcionales.

## Conectar Google Sheets

La URL de edicion de una hoja no es un endpoint JSON. La opcion recomendada es publicar un Google Apps Script como aplicacion web (o usar un backend existente) que lea solo las columnas necesarias y devuelva el formato anterior. Configura la URL de esa implementacion en `VITE_GOOGLE_SHEETS_API_URL` y verifica que admita solicitudes desde el dominio del frontend.

### Apps Script para esta colecta

El archivo [`google-apps-script/Code.gs`](google-apps-script/Code.gs) contiene el `doGet` listo para esta hoja. Lee exclusivamente la celda `A2` de la primera pestana:

- Si `A2` esta vacia, devuelve `data: []` y la aplicacion muestra el estado vacio.
- Si contiene un importe, devuelve `totalRecaudado` con ese valor.
- Acepta formatos como `5000000`, `5.000.000` y `$ 5.000.000,00`.

Para usarlo:

1. Abri la hoja de calculo y elegi **Extensiones > Apps Script**.
2. Reemplaza el contenido de `Code.gs` por el archivo del proyecto y guarda.
3. Presiona **Implementar > Nueva implementacion** y selecciona **Aplicacion web**.
4. Elige **Ejecutar como: yo**. Para que el sitio pueda consultar el monto sin iniciar sesion, selecciona el acceso publico disponible en tu cuenta; al hacerlo, estas haciendo publico el importe de `A2`.
5. Autoriza el script, implementalo y copia la URL que termina en `/exec`.
6. Pegala en tu `.env` y reinicia Vite:

   ```env
   VITE_GOOGLE_SHEETS_API_URL=https://script.google.com/macros/s/TU_ID_DE_IMPLEMENTACION/exec
   VITE_SHEETS_SYNC_INTERVAL=30000
   ```

La URL temporal que termina en `/dev` es solo para pruebas del editor de Apps Script; el frontend debe usar la URL de implementacion terminada en `/exec`.
