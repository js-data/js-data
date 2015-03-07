import create from './create';
import destroy from './destroy';
import destroyAll from './destroyAll';
import find from './find';
import findAll from './findAll';
import loadRelations from './loadRelations';
import reap from './reap';
import save from './save';
import update from './update';
import updateAll from './updateAll';

export default {
  create,
  destroy,
  destroyAll,
  find,
  findAll,
  loadRelations,
  reap,
  refresh(resourceName, id, options) {
    let _this = this;
    var DSUtils = _this.utils;

    return new DSUtils.Promise((resolve, reject) => {
      let definition = _this.defs[resourceName];
      id = DSUtils.resolveId(_this.defs[resourceName], id);
      if (!definition) {
        reject(new _this.errors.NER(resourceName));
      } else if (!DSUtils._sn(id)) {
        reject(DSUtils._snErr('id'));
      } else {
        options = DSUtils._(definition, options);
        options.bypassCache = true;
        options.logFn('refresh', id, options);
        resolve(_this.get(resourceName, id));
      }
    }).then(item => item ? _this.find(resourceName, id, options) : item);
  },
  save,
  update,
  updateAll
};
