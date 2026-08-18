import { productModel } from '../models/productModel.js';
import { auctionModel } from '../models/auctionModel.js';
import { listingModel } from '../models/listingModel.js';
import { seriesModel } from '../models/seriesModel.js';
import { languageModel, gradingCompanyModel, categoryModel } from '../models/lookupModel.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { notFound } from '../lib/httpError.js';
import {
  serializeProduct,
  serializeAuction,
  serializeCategory,
  serializeLanguage,
  serializeGradingCompany,
} from '../lib/serializers.js';
import { serializeSeries } from '../lib/formatSeries.js';

function parsePagination(query) {
  const page = Math.max(1, Number(query.page) || 1);
  const pageSize = Math.min(60, Math.max(1, Number(query.pageSize) || 24));
  return { page, pageSize };
}

export const catalogController = {
  // Accueil (specs §11) : best-sellers, plus vus, nouveautés, dernières mises
  // en vente, enchères en cours se terminant bientôt.
  home: asyncHandler(async (req, res) => {
    const [bestSellers, mostViewed, newest, recentlyListed, endingSoonAuctions] = await Promise.all([
      productModel.bestSellers(8),
      productModel.mostViewed(8),
      productModel.newest(8),
      productModel.recentlyListed(8),
      auctionModel.endingSoon(6),
    ]);

    res.json({
      bestSellers: bestSellers.map(serializeProduct),
      mostViewed: mostViewed.map(serializeProduct),
      newest: newest.map(serializeProduct),
      recentlyListed: recentlyListed.map(serializeProduct),
      endingSoonAuctions: endingSoonAuctions.map(serializeAuction),
    });
  }),

  // Recherche / Marketplace (specs §12-13)
  search: asyncHandler(async (req, res) => {
    const { page, pageSize } = parsePagination(req.query);
    const { categoryId, seriesId, name, page: _page, pageSize: _pageSize, ...characteristics } = req.query;
    const result = await productModel.search({ categoryId, seriesId, name, ...characteristics, page, pageSize });
    res.json({ ...result, items: result.items.map(serializeProduct) });
  }),

  // Fiche produit (specs §14-15)
  productDetail: asyncHandler(async (req, res, next) => {
    const product = await productModel.findById(req.params.id);
    if (!product) return next(notFound('Produit introuvable'));

    productModel.incrementViewCount(product.id);

    const [activeAuctionCount, activeListingCount] = await Promise.all([
      auctionModel.countActiveForProduct(product.id),
      listingModel.countActiveForProduct(product.id),
    ]);

    res.json({
      product: serializeProduct(product),
      activeAuctionCount,
      activeListingCount,
    });
  }),

  // Données pour construire les filtres (§12, §18, §39)
  series: asyncHandler(async (req, res) => {
    const series = await seriesModel.list();
    res.json({ series: series.map(serializeSeries) });
  }),

  categories: asyncHandler(async (req, res) => {
    const categories = await categoryModel.list();
    res.json({ categories: categories.map(serializeCategory) });
  }),

  languages: asyncHandler(async (req, res) => {
    const languages = await languageModel.list();
    res.json({ languages: languages.map(serializeLanguage) });
  }),

  gradingCompanies: asyncHandler(async (req, res) => {
    const companies = await gradingCompanyModel.list();
    res.json({ gradingCompanies: companies.map(serializeGradingCompany) });
  }),
};
