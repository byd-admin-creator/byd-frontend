import React from 'react';

const About = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - About BYD */}
      <section className="relative w-full h-screen">
        <div className="absolute inset-0">
          <img 
            src="about1.jpg" 
            alt="About BYD"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        </div>
        <div className="relative z-10 flex flex-col justify-center items-center h-full text-center px-4">
          <h1 className="text-6xl md:text-7xl font-light text-white mb-8">About BYD</h1>
          <div className="max-w-4xl">
            <p className="text-lg md:text-xl text-white leading-relaxed">
              Founded in 1995, BYD is a leading technology company devoted to leveraging innovations for a better life. 
              With more than 27 years of expertise, BYD has established itself as an industry leader in electronics, 
              automotives, renewable energy, and rail transit. As a global leader with more than 30 industrial parks 
              across 6 continents, BYD's zero-emission solutions, focused on energy generation and storage, are expansive and widely applicable.
            </p>
          </div>
        </div>
      </section>

      {/* Diversification Section */}
      <section className="relative w-full h-screen">
        <div className="absolute inset-0">
          <img 
            src="diversification-PC.png" 
            alt="Diversification"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        </div>
        <div className="relative z-10 flex flex-col justify-center items-center h-full text-center px-4">
          <h2 className="text-5xl md:text-6xl font-light text-white mb-16">Diversification</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16">
            <div className="text-center">
              <div className="mb-4">
                <img 
                  src="diversification-auto.png" 
                  alt="Auto"
                  className="w-20 h-20 md:w-24 md:h-24 mx-auto object-contain"
                />
              </div>
              <h3 className="text-xl md:text-2xl font-light text-white">Auto</h3>
            </div>
            <div className="text-center">
              <div className="mb-4">
                <img 
                  src="diversification-rail-transit2.png" 
                  alt="Rail Transit"
                  className="w-20 h-20 md:w-24 md:h-24 mx-auto object-contain"
                />
              </div>
              <h3 className="text-xl md:text-2xl font-light text-white">Rail Transit</h3>
            </div>
            <div className="text-center">
              <div className="mb-4">
                <img 
                  src="diversification-renewable-energy-new2.png" 
                  alt="Renewable Energy"
                  className="w-20 h-20 md:w-24 md:h-24 mx-auto object-contain"
                />
              </div>
              <h3 className="text-xl md:text-2xl font-light text-white">Renewable Energy</h3>
            </div>
            <div className="text-center">
              <div className="mb-4">
                <img 
                  src="diversification-electronics-new2.png" 
                  alt="Electronics"
                  className="w-20 h-20 md:w-24 md:h-24 mx-auto object-contain"
                />
              </div>
              <h3 className="text-xl md:text-2xl font-light text-white">Electronics</h3>
            </div>
          </div>
        </div>
      </section>

      {/* Globalization Section */}
      <section className="relative w-full h-screen">
        <div className="absolute inset-0">
          <img 
            src="globalization-pc.png" 
            alt="Globalization"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        </div>
        <div className="relative z-10 flex flex-col justify-center items-center h-full text-center px-4">
          <h2 className="text-5xl md:text-6xl font-light text-white mb-8">Globalization</h2>
          <div className="text-2xl md:text-3xl font-light text-white">
            <span className="text-yellow-400 font-medium">400+</span> cities，<span className="text-yellow-400 font-medium">70+</span> countries，<span className="text-yellow-400 font-medium">6</span> continents
          </div>
        </div>
      </section>

      {/* Auto Section */}
      <section className="relative w-full h-screen">
        <div className="absolute inset-0">
          <img 
            src="auto-pc-new.png" 
            alt="Auto"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        </div>
        <div className="relative z-10 flex flex-col justify-center items-center h-full text-center px-4">
          <div className="max-w-4xl">
            <h2 className="text-5xl md:text-6xl font-light text-white mb-8">Auto</h2>
            <p className="text-lg md:text-xl text-white leading-relaxed">
              BYD became a key player in the transition from gas powered vehicles to electric vehicles by developing 
              the cutting-edge Blade Battery and dual-mode hybrid power technology.
            </p>
          </div>
        </div>
      </section>

      {/* Blade Battery Section */}
      <section className="relative w-full min-h-screen">
        <div className="absolute inset-0">
          <img 
            src="blade-battery-pc.jpg" 
            alt="Blade Battery"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        </div>
        <div className="relative z-10 py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-5xl md:text-6xl font-light text-white text-center mb-16">Blade Battery</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center text-white">
                <h3 className="text-2xl font-medium mb-4">Ultra Safety</h3>
                <p className="text-sm md:text-base leading-relaxed">
                  The Blade Battery is the only battery that has passed the nail penetration test
                </p>
              </div>
              <div className="text-center text-white">
                <h3 className="text-2xl font-medium mb-4">Ultra Strength</h3>
                <p className="text-sm md:text-base leading-relaxed">
                  The Blade Battery can reach a compressive strength of up to 450 kN
                </p>
              </div>
              <div className="text-center text-white">
                <h3 className="text-2xl font-medium mb-4">Ultra-long Range</h3>
                <p className="text-sm md:text-base leading-relaxed">
                  With the Blade Battery, a BYD HAN EV has a range of 605 km
                </p>
              </div>
              <div className="text-center text-white">
                <h3 className="text-2xl font-medium mb-4">Ultra-high Charging Capability</h3>
                <p className="text-sm md:text-base leading-relaxed">
                  In just half hour, the battery can charge from 30% to 80% and has a maximum instantaneous discharge power
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DM-i Ultra-low Fuel Consumption */}
      <section className="relative w-full h-screen">
        <div className="absolute inset-0">
          <img 
            src="DM-i-PC.png" 
            alt="DM-i Ultra-low Fuel Consumption"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        </div>
        <div className="relative z-10 flex flex-col justify-center items-center h-full text-center px-4">
          <h2 className="text-4xl md:text-5xl font-light text-white mb-12">DM-i Ultra-low Fuel Consumption</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            <div className="text-white">
              <div className="text-4xl md:text-5xl font-bold mb-2">3.8 L</div>
              <div className="text-lg">Fuel Consumption at Low SOC</div>
            </div>
            <div className="text-white">
              <div className="text-4xl md:text-5xl font-bold mb-2">43.04 %</div>
              <div className="text-lg">World Leading Thermal Efficiency</div>
            </div>
            <div className="text-white">
              <div className="text-4xl md:text-5xl font-bold mb-2">1245 km</div>
              <div className="text-lg">Super Long Range</div>
            </div>
          </div>
        </div>
      </section>

      {/* DM-p Super Power */}
      <section className="relative w-full h-screen">
        <div className="absolute inset-0">
          <img 
            src="DM-p-PC.png" 
            alt="DM-p Super Power"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        </div>
        <div className="relative z-10 flex flex-col justify-center items-center h-full text-center px-4">
          <h2 className="text-4xl md:text-5xl font-light text-white mb-8">DM-p Super Power</h2>
          <div className="text-white">
            <div className="text-5xl md:text-6xl font-bold mb-4">4.3 seconds</div>
            <div className="text-xl">0-62 mph acceleration</div>
          </div>
        </div>
      </section>

      {/* e-Platform 3.0 */}
      <section className="relative w-full min-h-screen">
        <div className="absolute inset-0">
          <img 
            src="e-Platform-PC-new.png" 
            alt="e-Platform 3.0"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        </div>
        <div className="relative z-10 py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-5xl md:text-6xl font-light text-white text-center mb-16">e-Platform 3.0</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-white">
                <h3 className="text-2xl font-medium mb-4">Safety</h3>
                <p className="text-sm md:text-base leading-relaxed">
                  The e-Platform 3.0 integrates ultra-safe Blade batteries into the chassis, forming a robust and unique body structure
                </p>
              </div>
              <div className="text-white">
                <h3 className="text-2xl font-medium mb-4">High efficiency</h3>
                <p className="text-sm md:text-base leading-relaxed">
                  The new platform enables ranges exceeding (620 miles) through the world's first 8-in-1 electric powertrain
                </p>
              </div>
              <div className="text-white">
                <h3 className="text-2xl font-medium mb-4">Intelligence</h3>
                <p className="text-sm md:text-base leading-relaxed">
                  BYD'S advanced operating system enhances the driving experience. The vehicle's computer system continuously monitors environmental input to optimize for the driver's conditions
                </p>
              </div>
              <div className="text-white">
                <h3 className="text-2xl font-medium mb-4">Aesthetics</h3>
                <p className="text-sm md:text-base leading-relaxed">
                  This design prioritizes both passenger comfort and vehicle efficiency. Shorter overhangs and a longer wheelbase significantly expand the inside space of the vehicle and decrease the drag coefficient to 0.21 Cd
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BYD Intelligent Cockpit System */}
      <section className="relative w-full h-screen">
        <div className="absolute inset-0">
          <img 
            src="intelligent-cockpit-system-pc.jpg" 
            alt="BYD Intelligent Cockpit System"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        </div>
        <div className="relative z-10 flex flex-col justify-center items-center h-full text-center px-4">
          <h2 className="text-4xl md:text-5xl font-light text-white mb-8">BYD Intelligent Cockpit System</h2>
          <p className="text-lg md:text-xl text-white max-w-3xl">
            Seamlessly integrates smartphone functions into the vehicle's platform
          </p>
        </div>
      </section>

      {/* Vehicle Safety */}
      <section className="relative w-full h-screen">
        <div className="absolute inset-0">
          <img 
            src="vehicle-safety-PC.jpg" 
            alt="Vehicle Safety"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        </div>
        <div className="relative z-10 flex flex-col justify-center items-center h-full text-center px-4">
          <h2 className="text-4xl md:text-5xl font-light text-white mb-8">Vehicle Safety</h2>
          <p className="text-lg md:text-xl text-white max-w-3xl">
            Rigorously tested for quality and safety
          </p>
        </div>
      </section>

      {/* Market Performance */}
      <section className="relative w-full h-screen">
        <div className="absolute inset-0">
          <img 
            src="market-performance-PC-new.png" 
            alt="Market Performance"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        </div>
        <div className="relative z-10 flex flex-col justify-center items-center h-full text-center px-4">
          <h2 className="text-4xl md:text-5xl font-light text-white mb-8">Market Performance</h2>
          <p className="text-lg md:text-xl text-white max-w-3xl">
            As of September 2022, BYD sold nearly 2.68 million new energy passenger vehicles worldwide
          </p>
        </div>
      </section>

      {/* Cool the Earth By 1℃ */}
      <section className="relative w-full h-screen">
        <div className="absolute inset-0">
          <img 
            src="cool-the-earth-PC.png" 
            alt="Cool the Earth By 1℃"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        </div>
        <div className="relative z-10 flex flex-col justify-center items-center h-full text-center px-4">
          <h2 className="text-4xl md:text-5xl font-light text-white mb-8">Cool the Earth By 1℃</h2>
          <p className="text-lg md:text-xl text-white max-w-3xl">
            BYD is further committed to reducing contributions to climate change by electrifying public transportation
          </p>
        </div>
      </section>

      {/* Pollution and Emission Reduction */}
      <section className="relative w-full h-screen">
        <div className="absolute inset-0">
          <img 
            src="pollution-and-emission-reduction-PC-new.jpg" 
            alt="Pollution and Emission Reduction"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        </div>
        <div className="relative z-10 flex flex-col justify-center items-center h-full text-center px-4">
          <h2 className="text-4xl md:text-5xl font-light text-white mb-8">Pollution and Emission Reduction</h2>
          <div className="max-w-4xl">
            <p className="text-lg md:text-xl text-white leading-relaxed mb-4">
              Until October 11, 2022, BYD avoided the emission of 14,672,117,797 kg of carbon.
            </p>
            <p className="text-lg md:text-xl text-white font-medium">
              Let's protect our planet together!
            </p>
          </div>
        </div>
      </section>

      {/* Social Responsibility */}
      <section className="relative w-full h-screen">
        <div className="absolute inset-0">
          <img 
            src="social-responsibility-PC.jpg" 
            alt="Social Responsibility"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        </div>
        <div className="relative z-10 flex flex-col justify-center items-center h-full text-center px-4">
          <h2 className="text-4xl md:text-5xl font-light text-white mb-8">Social Responsibility</h2>
          <div className="max-w-4xl">
            <p className="text-lg md:text-xl text-white leading-relaxed">
              In 2020, BYD pivoted manufacturing and R&D efforts to address the global need for PPE. 
              In less than one month, BYD established the world's largest mask plant with a peak capacity 
              of up to 100 million pieces per day, supplying 80 global regions with essential health equipment.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;