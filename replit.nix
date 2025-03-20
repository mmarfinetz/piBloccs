{ pkgs }: {
  deps = [
    pkgs.python310Full
    pkgs.pip
    pkgs.nodejs-18_x
    pkgs.nodePackages.npm
    pkgs.python310Packages.flask
    pkgs.python310Packages.matplotlib
    pkgs.python310Packages.numpy
    pkgs.python310Packages.pillow
  ];
} 