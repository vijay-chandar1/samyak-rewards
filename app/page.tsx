import { Navbar } from './(landing)/_components/Navbar';
import { Hero } from './(landing)/_components/Hero';
import { Features } from './(landing)/_components/Features';
import { FAQ } from './(landing)/_components/FAQ';
import { Pricing } from './(landing)/_components/Pricing';
import { Footer } from './(landing)/_components/Footer';
import { ScrollToTop } from './(landing)/_components/ScrollToTop';
import PageContainer from '@/components/layout/page-container';

function App() {
  return (
    <PageContainer scrollable>
      <div className="w-full -ml-4 md:-ml-6">
        <Navbar />
        <Hero />
        <hr className="mx-auto w-11/12" />
        <Features />
        <hr className="mx-auto w-11/12" />
        <Pricing />
        <hr className="mx-auto w-11/12" />
        <FAQ />
        <hr className="mx-auto w-11/12" />
        <Footer />
        <ScrollToTop />
      </div>
    </PageContainer>
  );
}

export default App;
