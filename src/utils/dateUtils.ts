export const parseDate = (dateString: string) => {
    if (dateString.toUpperCase() === 'TBA') {
      return {
        display: 'TBA',
        sortValue: new Date(8640000000000000)
      };
    }
  
    const [day, month, year] = dateString.split('/').map(num => parseInt(num, 10));
    
    if (day && month && year) {
      const dateObject = new Date(year, month - 1, day);
      if (!isNaN(dateObject.getTime())) {
        return {
          display: dateString,
          sortValue: dateObject
        };
      }
    }
    
    return {
      display: dateString,
      sortValue: new Date(0)
    };
  };