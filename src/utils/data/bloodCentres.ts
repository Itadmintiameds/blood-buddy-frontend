export interface SuperAdminBloodCentre {
  id: number;
  name: string;
  address: string;
  city: string;
  phoneNumber: string;
}

export const bloodCentres: SuperAdminBloodCentre[] = [
  {
    id: 1,
    name: "KVR Blood Center",
    address: "28, Sarathna Nagar",
    city: "Mysore",
    phoneNumber: "805059918",
  },
  {
    id: 2,
    name: "Royal Blood Center",
    address: "5th Phase, JP Nagar",
    city: "Bangalore",
    phoneNumber: "985591358",
  },
  {
    id: 3,
    name: "ABC Blood Center",
    address: "28/2 Rotary Colony",
    city: "Bangalore",
    phoneNumber: "681928919",
  },
  {
    id: 4,
    name: "GTTTV Blood Center",
    address: "7th Phase, Jayanagar",
    city: "Bangalore",
    phoneNumber: "7818206258",
  },
  {
    id: 5,
    name: "Tiameds Blood Center",
    address: "26, Gandhi Nagar",
    city: "Mysore",
    phoneNumber: "968866208",
  },
];
