class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }
  filter() {
    let queryOBJ = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((ele) => delete queryOBJ[ele]);
    // advanced filtering:
    let queryStr = JSON.stringify(queryOBJ);
    queryStr = queryStr.replace(
      /\b(gte|gt|lte|lt|ne)\b/g,
      (match) => `$${match}`
    );
    queryOBJ = JSON.parse(queryStr);
    this.query = this.query.find(queryOBJ);
    return this;
  }
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    }
    // } else {
    //   this.query = this.query.sort('duration');
    // }
    return this;
  }
  limitingFields() {
    if (this.queryString.fields) {
      const selectedFields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(selectedFields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }
  paginate() {
    let page = this.queryString.page * 1 || 1;
    let limit = this.queryString.limit * 1 || 100;
    let skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}
module.exports = APIFeatures;
