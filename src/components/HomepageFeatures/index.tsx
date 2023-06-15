import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Learn the solution',
    Svg: require('@site/static/img/rocket.svg').default,
    description: (
      <>
        Learn the solution to get your Cloud Call Center up and running quickly.
      </>
    ),
  },
  {
    title: 'Focus on productivity',
    Svg: require('@site/static/img/goal.svg').default,
    description: (
      <>
        With our tutorials you will get best effeciency.
      </>
    ),
  },
  {
    title: 'Stay updated',
    Svg: require('@site/static/img/update.svg').default,
    description: (
      <>
        Check News and release notes to know what to try next.
      </>
    ),
  },
];

function Feature({title, Svg, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
