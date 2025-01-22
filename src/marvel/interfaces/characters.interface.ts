export interface Comic {
  id: number;
  title: string;
  upc;
  character: {
    items: Array<{
      name: string;
      resourceURI: string;
    }>;
  };
}
