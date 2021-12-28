import { AavegotchiContractObject } from "types";

export interface AavegotchisOfOwner {
  aavegotchis: Array<AavegotchiContractObject>
}

export interface AavegotchisRandom {
  aavegotchis: Array<AavegotchiContractObject>
}

export const getAllAavegotchisOfOwner = (owner: string) => {
  const query = `
    {
      aavegotchis(first: 1000, orderBy: withSetsRarityScore, orderDirection: desc,  where: { owner:"${owner.toLowerCase()}", status: 3 }) {
        id
        name
        withSetsNumericTraits
        equippedWearables
        withSetsRarityScore
        owner {
          id
        }
      }
    }
  `
  return query;
}

// now create a query to help randomly fetch gotchis
export const getRandomAavegotchis = (num: number) => {
  // pick random out of the first 10000 gotchis
  const skipNum = Math.floor(Math.random()*10000);
  const query = `
    {
      aavegotchis(first: ${num}, where: { id_gt: ${skipNum}, status: 3 }) {
        id
        name
        withSetsNumericTraits
        equippedWearables
        withSetsRarityScore
        owner {
          id
        }
      }
    }
  `
  return query;
}