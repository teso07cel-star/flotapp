// Configuración Maestra de Sucursales B8.2
// Incluye coordenadas aproximadas para cálculo táctico de rutas

export const START_POINTS = {
    "TESO_NORTE": { 
        nombre: "Tesorería Norte (Florida)", 
        direccion: "Bernardo de Irigoyen 1533, Florida",
        lat: -34.5292, lng: -58.5031 
    },
    "TESO_SAN_TELMO": { 
        nombre: "Teso San Telmo (México)", 
        direccion: "México 836, CABA",
        lat: -34.6174, lng: -58.3812 
    }
};

// Mapeo de conductores a punto de partida (Nombres Completos B8.3)
export const DRIVER_START_MAP = {
    "Gally Nelson": "TESO_NORTE",
    "Iván Santillán": "TESO_NORTE",
    "Juan Cruz Hidalgo": "TESO_NORTE",
    "Tomás Casco": "TESO_NORTE",
    "David Francisconi": "TESO_SAN_TELMO",
    "Diego Retamar": "TESO_SAN_TELMO",
    "Gonzalo Martinez": "TESO_SAN_TELMO",
    "Gerardo Visconti": "TESO_SAN_TELMO",
    "Jonathan Vondrak": "TESO_SAN_TELMO",
    "Miguel Cejas": "TESO_SAN_TELMO",
    "Daniel": "TESO_SAN_TELMO"
};

export const BRANCH_COORDINATES = {
    "San Martin": { lat: -34.5772, lng: -58.5423, direccion: "Bartolomé Mitre 3586" },
    "Moron": { lat: -34.6491, lng: -58.6224, direccion: "Ntra Sra del Buen Viaje 713" },
    "San Justo": { lat: -34.6752, lng: -58.5621, direccion: "Almafuerte 3118" },
    "Ramos": { lat: -34.6463, lng: -58.5632, direccion: "Av. de Mayo 338" },
    "San Miguel": { lat: -34.5422, lng: -58.7131, direccion: "Av. Pte. J. D. Perón 1091" },
    "Zarate": { lat: -34.0952, lng: -59.0243, direccion: "Justa Lima de Atucha 186" },
    "Campana": { lat: -34.1631, lng: -58.9612, direccion: "Av. Ing. Agustín Rocca 79" },
    "Pacheco": { lat: -34.4602, lng: -58.6271, direccion: "Av. Hipólito Yrigoyen 885" },
    "Pacheco NOVO": { lat: -34.4552, lng: -58.6261, direccion: "Boulogne Sur Mer 1275" },
    "San Fernando": { lat: -34.4442, lng: -58.5561, direccion: "Constitución 866" },
    "San Isidro": { lat: -34.4722, lng: -58.5121, direccion: "Gral. Manuel Belgrano 273" },
    "San Isidro ROLON": { lat: -34.4822, lng: -58.5411, direccion: "Av. Avelino Rolón 248" },
    "Martinez": { lat: -34.4982, lng: -58.5081, direccion: "Av. Sta Fe 1812" },
    "Olivos": { lat: -34.5122, lng: -58.4841, direccion: "Av. Maipú 2443" },
    "Vicente Lopez": { lat: -34.5362, lng: -58.4731, direccion: "Av. Maipú 323" },
    "Belgrano": { lat: -34.5612, lng: -58.4521, direccion: "Av. Cabildo 1789" },
    "Cabildo": { lat: -34.5622, lng: -58.4522, direccion: "Av. Cabildo 1789" },
    "Barrio Norte": { lat: -34.5952, lng: -58.4011, direccion: "Av. Sta. Fe 2349" },
    "Plaza Italia": { lat: -34.5822, lng: -58.4231, direccion: "Av. Sta. Fe 4114" },
    "Parque Patricios": { lat: -34.6332, lng: -58.3991, direccion: "La Rioja 2074" },
    "Once": { lat: -34.6042, lng: -58.3981, direccion: "Av. Corrientes 2254" },
    "Madero": { lat: -34.6132, lng: -58.3611, direccion: "Pierina Dealessi 578" },
    "Canning": { lat: -34.8582, lng: -58.5041, direccion: "Mariano Castex 1277" },
    "Monte Grande": { lat: -34.8212, lng: -58.4681, direccion: "Mariano Acosta 49" },
    "Adrogue": { lat: -34.8012, lng: -58.3911, direccion: "Esteban Adrogué 1181" },
    "Lomas": { lat: -34.7622, lng: -58.4011, direccion: "Av. Meeks 146" },
    "Banfield": { lat: -34.7432, lng: -58.3911, direccion: "Av. Adolfo Alsina 647" },
    "Lanus": { lat: -34.7082, lng: -58.3971, direccion: "Av. Hipólito Yrigoyen 4289" },
    "Avellaneda": { lat: -34.6612, lng: -58.3661, direccion: "Av. Bartolomé Mitre 521" },
    "Wilde": { lat: -34.7012, lng: -58.3151, direccion: "Av. Bartolomé Mitre 6350" },
    "Bernal": { lat: -34.7062, lng: -58.2751, direccion: "9 de Julio 10" },
    "Berazategui": { lat: -34.7612, lng: -58.2101, direccion: "Av. 14 5135" },
    "Varela": { lat: -34.8142, lng: -58.2751, direccion: "Av. Gral. José de San Martín 2945" },
    "Berisso": { lat: -34.8722, lng: -57.8861, direccion: "Av. Montevideo 209" },
    "La Plata": { lat: -34.9122, lng: -57.9501, direccion: "Calle 50 643" },
    "La Plata 56": { lat: -34.9202, lng: -57.9521, direccion: "Calle 56 839" },
    "Chascomus": { lat: -35.5762, lng: -58.0101, direccion: "Libres del Sur 202" },
    "Gualeguaychú": { lat: -33.0112, lng: -58.5131, direccion: "Alberdi 45" },
    "Concordia": { lat: -31.3962, lng: -58.0211, direccion: "Urquiza 710" },
    "La Paz": { lat: -30.7442, lng: -59.6451, direccion: "San Martín 928" },
    "Olavarría": { lat: -36.8922, lng: -60.3231, direccion: "Dorrego 2771" },
    "Tandil": { lat: -37.3272, lng: -59.1381, direccion: "9 de Julio 484" },
    "Tres Arroyo": { lat: -38.3752, lng: -60.2791, direccion: "Hipólito Yrigoyen 35" },
    "Coronel Suarez": { lat: -37.4582, lng: -61.9331, direccion: "Sarmiento 202" },
    "Independencia (MDQ)": { lat: -37.9942, lng: -57.5581, direccion: "Av. Independencia 1497" },
    "Güemes (MDQ)": { lat: -38.0132, lng: -57.5451, direccion: "Güemes 2551" },
    "VOY Y VUELVO": { lat: -34.6037, lng: -58.3792, direccion: "Av. Corrientes 809, CABA" },
    "Nordelta 2": { lat: -34.4132, lng: -58.6441, direccion: "Av. de los Lagos 6855" }
};
