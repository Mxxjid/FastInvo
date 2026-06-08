import { Routes, Route } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import CreateInvoicePage from "./components/CreateInvoicePage";
import HistoryPage from "./components/HistoryPage";
import SettingsPage from "./components/SettingsPage";
import Preview from "./components/Preview";
import CustomersPage from "./components/CustomersPage";
import ProductsPage from "./components/ProductsPage";
import ReportsPage from "./components/ReportsPage";
import BottomNav from "./components/BottomNav";

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/create-invoice" element={<CreateInvoicePage />} />
        <Route path="/edit/:id" element={<CreateInvoicePage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/preview" element={<Preview />} />
        <Route path="/customers" element={<CustomersPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
      </Routes>
      <BottomNav />
    </div>
  );
}

export default App;
