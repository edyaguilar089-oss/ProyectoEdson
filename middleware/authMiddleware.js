exports.isAdmin = (req, res, next) => {
  if (req.session.user && req.session.user.rol === 'admin') {
    next();
  } else {
    res.status(403).send('Acceso denegado');
  }
};
