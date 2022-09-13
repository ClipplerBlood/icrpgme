// SPDX-FileCopyrightText: 2022 Johannes Loher
//
// SPDX-License-Identifier: MIT

export async function preloadTemplates() {
  const templatePaths = [
    // Add paths to "systems/icrpgme/templates"
  ];

  return loadTemplates(templatePaths);
}
