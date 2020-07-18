<div className="col s1">
  {currentGrade ? (
    <div>
      <h4>Grade</h4>
      <div>
        <label>
          <strong>Categoria:</strong>
        </label>{' '}
        {currentGrade.category}
      </div>
      <div>
        <label>
          <strong>Descrição:</strong>
        </label>{' '}
        {currentGrade.description}
      </div>
      <div>
        <label>
          <strong>Value:</strong>
        </label>{' '}
        {currentGrade.value}
      </div>

      <Link to={'/grade/' + currentGrade._id} className="badge badge-warning">
        Edit
      </Link>
    </div>
  ) : (
    <div>
      <br />
      <p>Please click on a Grade...</p>
    </div>
  )}
</div>;
