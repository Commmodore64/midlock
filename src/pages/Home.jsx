import React, { useEffect, useState } from "react";
import TabBar from "../components/tabBar";
import Wallpaper from "../assets/wallpaper.svg";
import { getDatabase, ref, onValue } from "firebase/database";
import { uid } from "uid";
import { MdModeEditOutline } from "react-icons/md";
import { io } from "socket.io-client";
import { NavLink } from "react-router-dom";

const Home = () => {
  const [data, setData] = useState([]);
  const storedUID = localStorage.getItem("uidToken");
  const socket = io('http://localhost:5173'); // URL para el servidor de websocket

  const fetchData = async () => {
    try {
      const databaseRef = ref(getDatabase());
      const snapshot = await onValue(databaseRef, (snapshot) => {
        const dataFromDB = snapshot.val();
        const filteredData = Object.entries(dataFromDB)
          .map(([key, value]) => ({
            id: key,
            ...value,
          }))
          .filter((item) => item.id === storedUID);
        setData(filteredData);
        //console.log(dataFromDB);
      });
    } catch (error) {
      console.log("Error al obtener datos: ", error);
    }
  };

  useEffect(() => {
    if (storedUID) {
      console.log("UID del usuario:", storedUID);
      fetchData();
    } else {
      console.log("No hay usuario autenticado");
      window.location.href = "/";
    }

    // Suscribirse al evento 'dataUpdated' del servidor de websockets
    socket.on('dataUpdated', (updatedData) => {
      setData(updatedData);
    });

    return () => {
      // Desconectar el socket al desmontar el componente
      socket.disconnect();
    };
  }, []);

  return (
    <div
      className="w-screen h-screen flex flex-col"
      style={{
        backgroundImage: `url(${Wallpaper})`,
        backgroundRepeat: "repeat",
        backgroundSize: "cover",
      }}
    >
      <div className="flex flex-col font-semibold text-4xl mt-12 ml-4">
        Home
        <h2 className="flex items-center justify-between text-xl font-semibold mt-10 ml-4">
          <span className="mr-2">Your Med list</span>
          <NavLink to="/edit">
          <button className="flex items-center text-blue-500 hover:text-blue-700 focus:outline-none">
            <span className="mr-5">
              <MdModeEditOutline size={28} />
            </span>
          </button>
          </NavLink>
        </h2>
      </div>
      <div className="flex flex-col flex-grow px-4 mt-5">
        {data.map((item) => {
          const keys = Object.keys(item);
          return keys
            .filter((key) => key !== "id")
            .map((key) => (
              <div
                key={key}
                className="bg-white rounded-2xl shadow-lg p-3.5 mb-4"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-lg font-bold">{item[key].med}</p>
                    <p className="text-lg font-bold">{item[key].des}</p>
                  </div>
                  <p className="text-lg font-bold">x{item[key].cant}</p>
                </div>
              </div>
            ));
        })}
      </div>

      <TabBar />
    </div>
  );
};

export default Home;
