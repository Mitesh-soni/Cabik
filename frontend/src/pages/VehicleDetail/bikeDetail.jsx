import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar.jsx";
import Footer from "../../components/Footer.jsx";
import { getBikeById } from "../../api/vehicleApi.js";

export default function BikeDetail() {
  const { id } = useParams();
  const [bike, setBike] = useState(null);

  useEffect(() => {
    loadBike();
  }, []);

  const loadBike = async () => {
    try {
      const res = await getBikeById(id);
      console.log(bike)
      setBike(res.data?.vehicle);
    } catch (err) {
      console.error(err);
    }
  };

  if (!bike) return <p>Loading...</p>;

  return (
    <>
      <Navbar />
      <main>
        <h1>{bike.brand} {bike.model}</h1>
        <img src={bike.front_image} alt={bike.model} />
        <p>Engine: {bike.engine_cc} CC</p>
      </main>
      <Footer />
    </>
  );
}
