/*
 * Copyright 2013 Palantir Technologies, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/// <reference path="../../typings/chai.d.ts" />
/// <reference path="../../typings/chai-assert.d.ts" />
/// <reference path="../../typings/mocha.d.ts" />

/// <reference path="../../src/main.ts" />

/// <reference path="plugins/listenableDictionaryTests.ts" />
/// <reference path="plugins/contextNodeTests.ts" />
/// <reference path="plugins/dataSetTests.ts" />

module Lyra {
    export module Test {
        var assert = chai.assert;

        // Check if dependencies are included to avoid stupid failures
        describe("Dependencies", function() {
            it("Underscore", function() {
                assert.ok(_);
            });

            it("d3", function() {
                assert.ok(d3);
            });
        });

        Lyra.Test.runListenableDictionaryTests();
        Lyra.Test.runContextNodeTests();
        Lyra.Test.runDataSetTests();
    }
}
