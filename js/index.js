/* Lendo arquivos .JSON COM JQUERY
 */
const jsonnModel = $.getJSON({
  url: "./data/equipmentModel.json",
  async: false,
});
const jsonnEquipament = $.getJSON({
  url: "./data/equipment.json",
  async: false,
});
const jsonnState = $.getJSON({
  url: "./data/equipmentState.json",
  async: false,
});
const jsonnHistory = $.getJSON({
  url: "./data/equipmentPositionHistory.json",
  async: false,
});
const jsonnStateHis = $.getJSON({
  url: "./data/equipmentStateHistory.json",
  async: false,
});
function initMap() {
  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 5,
    center: { lat: -19.912998, lng: -43.940933 },
  });
  //
  const now = new Date();
  jsonnModel.responseJSON.map((model) => {
    jsonnEquipament.responseJSON.map((eq) => {
      if (model.id == eq.equipmentModelId) {
        jsonnHistory.responseJSON.map((pHist) => {
          if (eq.id == pHist.equipmentId) {
            jsonnStateHis.responseJSON.map((hState) => {
              if (pHist.equipmentId == hState.equipmentId) {
                /**
                 * Recupera data mais rescente do historico de datas
                 */
                let lastState = {};
                hState.states.forEach((state) => {
                  const stDate = new Date(state.date);
                  const diff = now.getTime() - stDate.getTime();

                  if (diff < now.getTime()) {
                    lastState = state;
                  }
                });

                // Se nao encontrar a posicao de acordo com a data mais rescente, recupera a ultima posicao
                let pos = pHist.positions.find((p) => p.date == lastState.date);
                pos = !pos ? pHist.positions[pHist.positions.length - 1] : pos;

                // Recupera o estado do equipamento de acordo com a data mais rescente
                const state = jsonnState.responseJSON.find(
                  (s) => s.id == lastState.equipmentStateId
                );

                const vehicle = {
                  name: model.name,
                  equipment: eq.name,
                  date: lastState.date,
                  lat: pos.lat,
                  lon: pos.lon,
                  state: state.name,
                  color: state.color,
                };

                //Marcador
                const symbol = {
                  path: "M 0,0 C -2,-20 -10,-22 -10,-30 A 10,10 0 1,1 10,-30 C 10,-22 2,-20 0,0 z M -2,-30 a 2,2 0 1,1 4,0 2,2 0 1,1 -4,0",
                  fillColor: vehicle.color,
                  fillOpacity: 1,
                  strokeColor: "#000",
                  strokeWeight: 2,
                  scale: 1,
                };
                const marker = new google.maps.Marker({
                  position: { lat: vehicle.lat, lng: vehicle.lon },
                  map,
                  title: vehicle.equipment,
                  icon: symbol,
                });
                //Aba de informacoes !
                const contentVehicle = `
                  <div style="width: 100%; display: flex; justify-content: center;">
                      <strong>${vehicle.name}</strong>
                  </div>
                  <div style="width: 100%; margin: 10px 0; text-align: center;">
                      <span><strong>Equipamento:</strong> ${
                        vehicle.equipment
                      }</span> <br>
                      <span><strong>Estado:</strong> ${
                        vehicle.state
                      }</span> <br>
                      <span><strong>Data:</strong> ${vehicle.date
                        .replaceAll("-", "/")
                        .replaceAll("Z", " ")
                        .replaceAll("T", " ")}</span> <br>
                      <span><strong>Latitude:</strong> ${
                        vehicle.lat
                      }</span> <br>
                      <span><strong>Longetude:</strong> ${
                        vehicle.lon
                      }</span> <br>
                      
                  </div>
                `;

                const infowindow = new google.maps.InfoWindow({
                  content: contentVehicle,
                });

                marker.addListener("mouseover", () => {
                  infowindow.open({
                    anchor: marker,
                    map,
                    shouldFocus: false,
                  });
                });
              }
            });
          }
        });
      }
    });
  });
}

window.initMap = initMap;
