import { getWallListAPI } from '@/api/wall';

import { Freedom } from './Freedom';
import { Gallery } from './Gallery';
import { Location } from './Location';
import { Milestone } from './Milestone';
import { CurrentWork, Direction, Vision } from './Narrative';
import { OpenSource } from './OpenSource';
import { Quote } from './Quote';
import { Services } from './Services';
import { Sponsor } from './Sponsor';
import { Wall } from './Wall';

export async function InfoSections() {
  const walls = (await getWallListAPI()).slice(0, 42);

  return (
    <>
      <Location />
      <CurrentWork />
      <Services />
      <Vision />
      <Direction />
      <Freedom />
      <Gallery />
      <OpenSource />
      <Sponsor />
      <Wall walls={walls} />
      <Quote />
      <Milestone />
    </>
  );
}
