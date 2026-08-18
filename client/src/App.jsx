import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { Layout } from './components/layout/Layout.jsx';
import { ProtectedRoute } from './components/common/ProtectedRoute.jsx';

import { Home } from './pages/Home.jsx';
import { Search } from './pages/Search.jsx';
import { ProductDetail } from './pages/ProductDetail.jsx';
import { Auctions } from './pages/Auctions.jsx';
import { AuctionDetail } from './pages/AuctionDetail.jsx';
import { CreateAuction } from './pages/CreateAuction.jsx';
import { SellClassic } from './pages/SellClassic.jsx';
import { Collection } from './pages/Collection.jsx';
import { Cart } from './pages/Cart.jsx';
import { SellerProfile } from './pages/SellerProfile.jsx';
import { Login } from './pages/Login.jsx';
import { Register } from './pages/Register.jsx';
import { NotFound } from './pages/NotFound.jsx';

import { AccountLayout } from './pages/account/AccountLayout.jsx';
import { AccountProfile } from './pages/account/AccountProfile.jsx';
import { AccountAddresses } from './pages/account/AccountAddresses.jsx';
import { AccountPayment } from './pages/account/AccountPayment.jsx';
import { AccountShipping } from './pages/account/AccountShipping.jsx';
import { AccountPurchases } from './pages/account/AccountPurchases.jsx';
import { AccountSales } from './pages/account/AccountSales.jsx';
import { AccountAuctions } from './pages/account/AccountAuctions.jsx';
import { AccountMessages } from './pages/account/AccountMessages.jsx';

function AppProviders({ children }) {
  return (
    <AuthProvider>
      <CartProvider>{children}</CartProvider>
    </AuthProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProviders>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="recherche" element={<Search />} />
            <Route path="produits/:id" element={<ProductDetail />} />
            <Route path="encheres" element={<Auctions />} />
            <Route path="encheres/:id" element={<AuctionDetail />} />
            <Route path="vendeurs/:id" element={<SellerProfile />} />
            <Route path="panier" element={<Cart />} />
            <Route path="connexion" element={<Login />} />
            <Route path="inscription" element={<Register />} />

            <Route element={<ProtectedRoute />}>
              <Route path="produits/:id/vendre" element={<SellClassic />} />
              <Route path="produits/:id/encherir" element={<CreateAuction />} />
              <Route path="collection" element={<Collection />} />

              <Route path="compte" element={<AccountLayout />}>
                <Route index element={<AccountProfile />} />
                <Route path="adresses" element={<AccountAddresses />} />
                <Route path="paiement" element={<AccountPayment />} />
                <Route path="livraison" element={<AccountShipping />} />
                <Route path="achats" element={<AccountPurchases />} />
                <Route path="ventes" element={<AccountSales />} />
                <Route path="encheres" element={<AccountAuctions />} />
                <Route path="messages" element={<AccountMessages />} />
                <Route path="messages/:conversationId" element={<AccountMessages />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </AppProviders>
    </BrowserRouter>
  );
}
