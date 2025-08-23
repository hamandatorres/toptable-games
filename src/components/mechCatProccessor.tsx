import { Option, OptionNoName } from 'customTypes';

const mechCatProcessor = (
  mechanics: OptionNoName[],
  categories: OptionNoName[],
  mechanicsLib: Option[],
  categoriesLib: Option[]
): { mechanicsProcessed: string; categoriesProcessed: string } => {
  const mechanicsProcessed: string[] = [];
  const categoriesProcessed: string[] = [];

  mechanics.forEach((searchResMec: { id: string; url: string }, ind: number) => {
    mechanicsLib.forEach((mecLib: Option) => {
      if (mecLib.id === searchResMec.id) {
        mechanicsProcessed[ind] = mecLib.name;
      }
    });
  });
  categories.forEach((searchResCat: { id: string; url: string }, ind: number) => {
    categoriesLib.forEach((catLib: Option) => {
      if (catLib.id === searchResCat.id) {
        categoriesProcessed[ind] = catLib.name;
      }
    });
  });

  return { mechanicsProcessed: mechanicsProcessed.join(', '), categoriesProcessed: categoriesProcessed.join(', ') };
};

export default mechCatProcessor;
