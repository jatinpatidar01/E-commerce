import Navbar from './components/navbar';
import CategoryBar from './components/categoryBar';

export default function CustomerLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50/50">
      <Navbar />
      <CategoryBar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
