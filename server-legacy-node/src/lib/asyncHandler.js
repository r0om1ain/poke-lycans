// Évite les try/catch répétés dans chaque contrôleur : toute erreur (sync ou
// rejetée) est transmise à errorHandler via next().
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
