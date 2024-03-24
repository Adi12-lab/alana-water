import Chart from "./component/chart";
import HariIni from "./component/hari-ini";
import JumlahGalon from "./component/jumlah-galon";
export default function Dashboard() {
  return (
    <div>
      <h1 className="font-bold text-3xl">Selamat datang Admin</h1>
      <div className="mt-4 flex items-center gap-x-4">
        <JumlahGalon />
        <HariIni />
      </div>
      <div className="mt-10">
        <h2 className="font-semibold text-lg mb-4">Rekap Tahun ini</h2>
        <Chart />
      </div>
    </div>
  );
}
