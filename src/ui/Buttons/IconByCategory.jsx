import PropTypes from 'prop-types';
import { CategoriesMap } from './categories.map';
import { UnknownButton } from './UnknownButton';
import { useTransactionTypeColor } from './useTransactionTypeColor.hook';

export function IconByCategory({ category, type, destination, onClick }) {
  const { backgroundColor, highlightColor } = useTransactionTypeColor(type);
  const SelectedCategoryButton = CategoriesMap[category];
  if (SelectedCategoryButton) {
    return (
      <SelectedCategoryButton
        destination={destination}
        onClick={onClick}
        backgroundColor={backgroundColor}
        highlightColor={highlightColor}
      />
    );
  }
  return (
    <UnknownButton
      destination={destination}
      onClick={onClick}
      backgroundColor={backgroundColor}
      highlightColor={highlightColor}
    />
  );
}

IconByCategory.propTypes = {
  category: PropTypes.string,
  type: PropTypes.string,
  destination: PropTypes.string,
  onClick: PropTypes.func,
};
