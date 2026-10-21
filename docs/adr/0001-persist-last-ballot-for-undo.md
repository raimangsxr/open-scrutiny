# Persistir la última papeleta contabilizada para deshacer

El escrutinio se guarda como totales agregados por opción (`vote_app_counts`), lo que no permite reconstruir qué opción restar al deshacer. Guardamos además un mapa `preguntaId → opciónId` de la última papeleta contabilizada (`vote_app_last_ballot`), escrito en la misma operación atómica que el incremento de totales, para que «Deshacer última papeleta» funcione tras recargar el navegador. La corrección manual de totales borra ese registro porque ya no refleja un único paso reversible.
